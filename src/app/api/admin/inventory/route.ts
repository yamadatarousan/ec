import { NextRequest, NextResponse } from 'next/server';
import {
  getInventoryAlerts,
  getInventoryStats,
  updateInventory,
  bulkUpdateInventory,
} from '@/lib/services/inventory';

// 在庫情報取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'alerts';

    switch (type) {
      case 'alerts':
        const alerts = await getInventoryAlerts();
        return NextResponse.json({
          success: true,
          data: alerts,
        });

      case 'stats':
        const stats = await getInventoryStats();
        return NextResponse.json({
          success: true,
          data: stats,
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid type parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Failed to get inventory data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get inventory data' },
      { status: 500 }
    );
  }
}

// 在庫更新
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    switch (type) {
      case 'update':
        const result = await updateInventory(data);
        return NextResponse.json(result);

      case 'bulk_update':
        const bulkResult = await bulkUpdateInventory(data.updates);
        return NextResponse.json(bulkResult);

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid type parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Failed to update inventory:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update inventory' },
      { status: 500 }
    );
  }
}
