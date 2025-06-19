import { prisma } from '@/lib/prisma';

/**
 * カートアイテムを追加
 */
export async function addToCart(
  userId: string,
  productId: string,
  quantity: number = 1
) {
  // 既存のカートアイテムをチェック
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (existingItem) {
    // 既存アイテムの数量を更新
    return prisma.cartItem.update({
      where: {
        id: existingItem.id,
      },
      data: {
        quantity: existingItem.quantity + quantity,
      },
      include: {
        product: {
          include: {
            images: {
              orderBy: { order: 'asc' },
              take: 1,
            },
            category: true,
          },
        },
      },
    });
  } else {
    // 新しいカートアイテムを作成
    return prisma.cartItem.create({
      data: {
        userId,
        productId,
        quantity,
      },
      include: {
        product: {
          include: {
            images: {
              orderBy: { order: 'asc' },
              take: 1,
            },
            category: true,
          },
        },
      },
    });
  }
}

/**
 * ユーザーのカートアイテム一覧を取得
 */
export async function getCartItems(userId: string) {
  return prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          images: {
            orderBy: { order: 'asc' },
            take: 1,
          },
          category: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * カートアイテムの数量を更新
 */
export async function updateCartItemQuantity(
  userId: string,
  productId: string,
  quantity: number
) {
  if (quantity <= 0) {
    // 数量が0以下の場合はアイテムを削除
    return removeFromCart(userId, productId);
  }

  return prisma.cartItem.update({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
    data: { quantity },
    include: {
      product: {
        include: {
          images: {
            orderBy: { order: 'asc' },
            take: 1,
          },
          category: true,
        },
      },
    },
  });
}

/**
 * カートからアイテムを削除
 */
export async function removeFromCart(userId: string, productId: string) {
  return prisma.cartItem.delete({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });
}

/**
 * カートをクリア
 */
export async function clearCart(userId: string) {
  return prisma.cartItem.deleteMany({
    where: { userId },
  });
}

/**
 * カート内のアイテム数を取得
 */
export async function getCartItemCount(userId: string) {
  const result = await prisma.cartItem.aggregate({
    where: { userId },
    _sum: { quantity: true },
  });

  return result._sum.quantity || 0;
}

/**
 * カートの合計金額を計算
 */
export async function getCartTotal(userId: string) {
  const cartItems = await getCartItems(userId);

  return cartItems.reduce((total, item) => {
    return total + Number(item.product.price) * item.quantity;
  }, 0);
}
