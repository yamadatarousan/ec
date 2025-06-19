import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@/types/order';

/**
 * 注文番号を生成
 */
function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const date = now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');

  return `EC${year}${month}${date}${random}`;
}

/**
 * 新しい注文を作成
 */
export async function createOrder(
  userId: string,
  addressId: string,
  notes?: string
) {
  // カートアイテムを取得
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          images: {
            orderBy: { order: 'asc' },
            take: 1,
          },
        },
      },
    },
  });

  if (cartItems.length === 0) {
    throw new Error('カートが空です');
  }

  // 住所の存在確認
  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
  });

  if (!address) {
    throw new Error('指定された住所が見つかりません');
  }

  // 注文金額計算
  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  const shippingCost = subtotal >= 10000 ? 0 : 500; // 1万円以上で送料無料
  const taxRate = 0.1; // 消費税10%
  const taxAmount = Math.floor(subtotal * taxRate);
  const totalAmount = subtotal + shippingCost + taxAmount;

  // トランザクションで注文作成
  const order = await prisma.$transaction(async tx => {
    // 注文作成
    const newOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        status: 'PENDING' as OrderStatus,
        totalAmount,
        shippingCost,
        taxAmount,
        notes,
        userId,
        addressId,
      },
    });

    // 注文明細作成
    await tx.orderItem.createMany({
      data: cartItems.map(item => ({
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: Number(item.product.price),
      })),
    });

    // 在庫更新
    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // カートをクリア
    await tx.cartItem.deleteMany({
      where: { userId },
    });

    return newOrder;
  });

  return order;
}

/**
 * ユーザーの注文履歴を取得
 */
export async function getUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      address: true,
      items: {
        include: {
          product: {
            include: {
              images: {
                orderBy: { order: 'asc' },
                take: 1,
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * 注文詳細を取得
 */
export async function getOrderById(orderId: string, userId: string) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      address: true,
      items: {
        include: {
          product: {
            include: {
              images: {
                orderBy: { order: 'asc' },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new Error('注文が見つかりません');
  }

  return order;
}

/**
 * 注文ステータスを更新（管理者用）
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  return prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
}

/**
 * 注文をキャンセル
 */
export async function cancelOrder(orderId: string, userId: string) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
      status: {
        in: ['PENDING', 'CONFIRMED'], // キャンセル可能なステータス
      },
    },
    include: {
      items: true,
    },
  });

  if (!order) {
    throw new Error('キャンセル可能な注文が見つかりません');
  }

  // トランザクションでキャンセル処理
  return prisma.$transaction(async tx => {
    // 注文ステータスを更新
    const cancelledOrder = await tx.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' as OrderStatus },
    });

    // 在庫を戻す
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }

    return cancelledOrder;
  });
}
