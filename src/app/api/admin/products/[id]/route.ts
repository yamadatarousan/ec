import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        images: {
          orderBy: { order: 'asc' },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // 評価の計算
    let averageRating = undefined;
    let reviewCount = 0;

    if (product.reviews.length > 0) {
      const totalRating = product.reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      averageRating = totalRating / product.reviews.length;
      reviewCount = product.reviews.length;
    }

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        price: Number(product.price),
        comparePrice: product.comparePrice
          ? Number(product.comparePrice)
          : undefined,
        weight: product.weight ? Number(product.weight) : undefined,
        averageRating,
        reviewCount,
      },
    });
  } catch (error) {
    console.error('Failed to get product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const body = await request.json();
    const {
      name,
      description,
      price,
      comparePrice,
      sku,
      stock,
      status,
      categoryId,
      weight,
      dimensions,
      tags,
      images,
    } = body;

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

    // SKUの重複チェック（自分以外）
    if (sku && sku !== existingProduct.sku) {
      const duplicateSku = await prisma.product.findFirst({
        where: {
          sku,
          id: { not: productId },
        },
      });

      if (duplicateSku) {
        return NextResponse.json(
          { success: false, error: 'SKU already exists' },
          { status: 409 }
        );
      }
    }

    // 商品更新
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        price,
        comparePrice: comparePrice || null,
        sku,
        stock,
        status,
        categoryId,
        weight: weight || null,
        dimensions: dimensions || null,
        // 画像は別途処理が必要（今回は簡略化）
      },
      include: {
        category: true,
        images: true,
      },
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
    console.error('Failed to update product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

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

    // 関連データの削除（カスケード削除で自動処理される）
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete product:', error);

    // 外部キー制約エラーの場合
    if (
      error instanceof Error &&
      error.message.includes('foreign key constraint')
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete product with existing orders or reviews',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
