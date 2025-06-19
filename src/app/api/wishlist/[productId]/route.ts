import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { ErrorFactory, ErrorLogger, createErrorResponse } from '@/lib/errors';

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

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

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: payload.userId,
          productId,
        },
      },
    });

    if (!favorite) {
      const error = ErrorFactory.notFound('お気に入り商品', productId);
      return NextResponse.json(createErrorResponse(error).response, {
        status: createErrorResponse(error).statusCode,
      });
    }

    await prisma.favorite.delete({
      where: {
        id: favorite.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'ウィッシュリストから削除しました',
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({
        success: true,
        data: { isFavorite: false },
      });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({
        success: true,
        data: { isFavorite: false },
      });
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: payload.userId,
          productId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        isFavorite: !!favorite,
        favoriteId: favorite?.id || null,
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
