import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProductStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // パラメータ取得
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const status = (searchParams.get('status') as ProductStatus) || undefined;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder =
      (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    const skip = (page - 1) * limit;

    // フィルター条件構築
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status;
    }

    // ソート条件構築
    const orderBy: any = {};
    if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else if (sortBy === 'stock') {
      orderBy.stock = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    // 商品取得
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        images: {
          orderBy: { order: 'asc' },
          take: 1,
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    // 評価の計算
    const productsWithRating = products.map(product => {
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

      const { reviews, ...productWithoutReviews } = product;

      return {
        ...productWithoutReviews,
        price: Number(product.price),
        comparePrice: product.comparePrice
          ? Number(product.comparePrice)
          : undefined,
        weight: product.weight ? Number(product.weight) : undefined,
        averageRating,
        reviewCount,
      };
    });

    return NextResponse.json({
      success: true,
      products: productsWithRating,
      pagination: {
        page,
        limit,
        total: await prisma.product.count({ where }),
      },
    });
  } catch (error) {
    console.error('Failed to fetch admin products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // 必須フィールドの検証
    if (!name || !description || !price || !sku || !categoryId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // SKUの重複チェック
    const existingProduct = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      return NextResponse.json(
        { success: false, error: 'SKU already exists' },
        { status: 409 }
      );
    }

    // 商品作成
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        comparePrice: comparePrice || null,
        sku,
        stock: stock || 0,
        status: status || 'DRAFT',
        categoryId,
        weight: weight || null,
        dimensions: dimensions || null,
        images: images
          ? {
              create: images.map((image: any, index: number) => ({
                url: image.url,
                alt: image.alt || '',
                order: index,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        images: true,
      },
    });

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        price: Number(product.price),
        comparePrice: product.comparePrice
          ? Number(product.comparePrice)
          : undefined,
        weight: product.weight ? Number(product.weight) : undefined,
      },
    });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
