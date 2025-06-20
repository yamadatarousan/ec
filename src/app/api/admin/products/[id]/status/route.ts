import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProductStatus } from '@prisma/client';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const body = await request.json();
    const { status } = body;

    // ステータスの検証
    if (!status || !['ACTIVE', 'INACTIVE', 'DRAFT'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    // 商品の存在確認
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // ステータス更新
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { status: status as ProductStatus },
    });

    return NextResponse.json({
      success: true,
      product: {
        ...updatedProduct,
        price: Number(updatedProduct.price),
        comparePrice: updatedProduct.comparePrice
          ? Number(updatedProduct.comparePrice)
          : undefined,
        weight: updatedProduct.weight
          ? Number(updatedProduct.weight)
          : undefined,
      },
    });
  } catch (error) {
    console.error('Failed to update product status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product status' },
      { status: 500 }
    );
  }
}
