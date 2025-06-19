import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { ErrorFactory, ErrorLogger, createErrorResponse } from '@/lib/errors';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      const error = ErrorFactory.unauthorized();
      return NextResponse.json(createErrorResponse(error).response, {
        status: createErrorResponse(error).statusCode,
      });
    }

    const payload = verifyToken(token);
    if (!payload) {
      const error = ErrorFactory.unauthorized('無効なトークンです');
      return NextResponse.json(createErrorResponse(error).response, {
        status: createErrorResponse(error).statusCode,
      });
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: payload.userId,
      },
      include: {
        product: {
          include: {
            images: {
              orderBy: {
                order: 'asc',
              },
            },
            category: true,
            reviews: {
              select: {
                rating: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const wishlistItems = favorites.map(favorite => ({
      id: favorite.id,
      product: {
        ...favorite.product,
        averageRating:
          favorite.product.reviews.length > 0
            ? favorite.product.reviews.reduce(
                (sum, review) => sum + review.rating,
                0
              ) / favorite.product.reviews.length
            : null,
        reviewCount: favorite.product.reviews.length,
      },
      addedAt: favorite.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: wishlistItems,
      count: wishlistItems.length,
    });
  } catch (error) {
    ErrorLogger.logWithRequest(error as Error, {
      method: request.method,
      url: request.url,
    });

    const errorResponse = createErrorResponse(error as Error);
    return NextResponse.json(errorResponse.response, {
      status: errorResponse.statusCode,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      const error = ErrorFactory.unauthorized();
      return NextResponse.json(createErrorResponse(error).response, {
        status: createErrorResponse(error).statusCode,
      });
    }

    const payload = verifyToken(token);
    if (!payload) {
      const error = ErrorFactory.unauthorized('無効なトークンです');
      return NextResponse.json(createErrorResponse(error).response, {
        status: createErrorResponse(error).statusCode,
      });
    }

    const { productId } = await request.json();

    if (!productId) {
      const error = ErrorFactory.validationError(
        '商品IDが必要です',
        'productId'
      );
      return NextResponse.json(createErrorResponse(error).response, {
        status: createErrorResponse(error).statusCode,
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      const error = ErrorFactory.notFound('商品', productId);
      return NextResponse.json(createErrorResponse(error).response, {
        status: createErrorResponse(error).statusCode,
      });
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: payload.userId,
          productId,
        },
      },
    });

    if (existingFavorite) {
      const error = ErrorFactory.alreadyExists('お気に入り', '商品', productId);
      return NextResponse.json(createErrorResponse(error).response, {
        status: createErrorResponse(error).statusCode,
      });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: payload.userId,
        productId,
      },
      include: {
        product: {
          include: {
            images: {
              orderBy: {
                order: 'asc',
              },
            },
            category: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'ウィッシュリストに追加しました',
      data: {
        id: favorite.id,
        product: favorite.product,
        addedAt: favorite.createdAt,
      },
    });
  } catch (error) {
    ErrorLogger.logWithRequest(error as Error, {
      method: request.method,
      url: request.url,
    });

    const errorResponse = createErrorResponse(error as Error);
    return NextResponse.json(errorResponse.response, {
      status: errorResponse.statusCode,
    });
  }
}
