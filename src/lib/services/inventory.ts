import { prisma } from '@/lib/prisma';
import { ProductStatus } from '@prisma/client';
import { sendInventoryAlertEmail } from '@/lib/services/email';

export interface InventoryAlert {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    sku: string;
    stock: number;
    category: {
      name: string;
    };
  };
  alertType: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'REORDER_POINT';
  threshold: number;
  currentStock: number;
  createdAt: Date;
  acknowledged: boolean;
}

export interface InventoryUpdateRequest {
  productId: string;
  adjustment: number; // 正の数は追加、負の数は減算
  reason: string;
  reference?: string; // 仕入先情報など
}

export interface StockMovement {
  id: string;
  productId: string;
  quantity: number;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  reason: string;
  reference?: string;
  createdAt: Date;
  product: {
    name: string;
    sku: string;
  };
}

/**
 * 在庫アラートを取得
 */
export async function getInventoryAlerts(
  acknowledged: boolean = false
): Promise<InventoryAlert[]> {
  try {
    const lowStockThreshold = 10; // 設定可能にする予定

    // 在庫が少ない商品を取得
    const lowStockProducts = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        stock: {
          lte: lowStockThreshold,
        },
      },
      include: {
        category: {
          select: { name: true },
        },
      },
      orderBy: {
        stock: 'asc',
      },
    });

    // アラート形式に変換
    const alerts: InventoryAlert[] = lowStockProducts.map(product => ({
      id: `alert_${product.id}`,
      productId: product.id,
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        stock: product.stock,
        category: {
          name: product.category.name,
        },
      },
      alertType: product.stock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
      threshold: lowStockThreshold,
      currentStock: product.stock,
      createdAt: new Date(),
      acknowledged: false,
    }));

    return alerts;
  } catch (error) {
    console.error('Failed to get inventory alerts:', error);
    return [];
  }
}

/**
 * 在庫アラートメールを送信
 */
export async function sendInventoryAlerts(
  adminEmails: string[] = ['admin@example.com']
): Promise<{ success: boolean; sentCount: number; errors: string[] }> {
  try {
    const alerts = await getInventoryAlerts();
    const errors: string[] = [];
    let sentCount = 0;

    for (const alert of alerts) {
      try {
        const result = await sendInventoryAlertEmail(adminEmails, {
          productName: alert.product.name,
          productSku: alert.product.sku,
          currentStock: alert.currentStock,
          threshold: alert.threshold,
          categoryName: alert.product.category.name,
        });

        if (result.success) {
          sentCount++;
        } else {
          errors.push(`Failed to send alert for ${alert.product.name}: ${result.error}`);
        }
      } catch (error) {
        errors.push(`Error sending alert for ${alert.product.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: errors.length === 0,
      sentCount,
      errors,
    };
  } catch (error) {
    console.error('Failed to send inventory alerts:', error);
    return {
      success: false,
      sentCount: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

/**
 * 在庫を更新
 */
export async function updateInventory(
  updateRequest: InventoryUpdateRequest
): Promise<{ success: boolean; newStock?: number; error?: string }> {
  try {
    const { productId, adjustment, reason, reference } = updateRequest;

    // 現在の商品情報を取得
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true, name: true },
    });

    if (!product) {
      return { success: false, error: '商品が見つかりません' };
    }

    const newStock = product.stock + adjustment;

    if (newStock < 0) {
      return { success: false, error: '在庫数は0未満にできません' };
    }

    // トランザクションで在庫更新と履歴記録を実行
    const result = await prisma.$transaction(async tx => {
      // 在庫を更新
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { stock: newStock },
      });

      // 在庫変動履歴を記録（将来的にStockMovementモデルを追加予定）
      // 現在はコンソールログで代用
      console.log(
        `Stock updated for ${product.name}: ${product.stock} -> ${newStock} (${adjustment >= 0 ? '+' : ''}${adjustment})`
      );

      return updatedProduct;
    });

    return { success: true, newStock: result.stock };
  } catch (error) {
    console.error('Failed to update inventory:', error);
    return { success: false, error: '在庫更新に失敗しました' };
  }
}

/**
 * 商品の在庫履歴を取得（将来実装）
 */
export async function getStockMovements(
  productId: string,
  limit: number = 50
): Promise<StockMovement[]> {
  // 将来的にStockMovementテーブルを追加して実装
  return [];
}

/**
 * 在庫統計を取得
 */
export async function getInventoryStats() {
  try {
    const [totalProducts, lowStockCount, outOfStockCount, totalStockValue] =
      await Promise.all([
        // 総商品数
        prisma.product.count({
          where: { status: 'ACTIVE' },
        }),

        // 在庫少ない商品数（0より多く10以下）
        prisma.product.count({
          where: {
            status: 'ACTIVE',
            stock: {
              gt: 0,
              lte: 10,
            },
          },
        }),

        // 在庫切れ商品数
        prisma.product.count({
          where: {
            status: 'ACTIVE',
            stock: 0,
          },
        }),

        // 総在庫価値を計算
        prisma.product.aggregate({
          where: { status: 'ACTIVE' },
          _sum: {
            stock: true,
          },
        }),
      ]);

    return {
      totalProducts,
      lowStockCount,
      outOfStockCount,
      totalStockItems: totalStockValue._sum.stock || 0,
      alertCount: lowStockCount + outOfStockCount,
    };
  } catch (error) {
    console.error('Failed to get inventory stats:', error);
    return {
      totalProducts: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      totalStockItems: 0,
      alertCount: 0,
    };
  }
}

/**
 * 複数商品の在庫を一括更新
 */
export async function bulkUpdateInventory(
  updates: InventoryUpdateRequest[]
): Promise<{ success: boolean; results?: any[]; error?: string }> {
  try {
    const results = await Promise.all(
      updates.map(update => updateInventory(update))
    );

    const failedUpdates = results.filter(result => !result.success);

    if (failedUpdates.length > 0) {
      return {
        success: false,
        error: `${failedUpdates.length}件の更新に失敗しました`,
        results,
      };
    }

    return { success: true, results };
  } catch (error) {
    console.error('Failed to bulk update inventory:', error);
    return { success: false, error: '一括更新に失敗しました' };
  }
}

/**
 * 在庫切れ商品のリストを取得
 */
export async function getOutOfStockProducts() {
  try {
    return await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        stock: 0,
      },
      include: {
        category: {
          select: { name: true },
        },
        images: {
          take: 1,
          orderBy: { order: 'asc' },
        },
      },
      orderBy: [{ updatedAt: 'desc' }, { name: 'asc' }],
    });
  } catch (error) {
    console.error('Failed to get out of stock products:', error);
    return [];
  }
}
