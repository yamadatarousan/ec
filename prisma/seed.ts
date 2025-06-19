import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('データベースシードを開始...');

  // カテゴリを作成
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: '家電・PC',
        slug: 'electronics',
        description: 'パソコン、家電製品、デジタル機器',
        imageUrl:
          'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=200&fit=crop',
      },
    }),
    prisma.category.create({
      data: {
        name: 'ファッション',
        slug: 'fashion',
        description: '衣類、靴、アクセサリー',
        imageUrl:
          'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=300&h=200&fit=crop',
      },
    }),
    prisma.category.create({
      data: {
        name: '本・雑誌',
        slug: 'books',
        description: '書籍、雑誌、電子書籍',
        imageUrl:
          'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop',
      },
    }),
    prisma.category.create({
      data: {
        name: 'ホーム・キッチン',
        slug: 'home-kitchen',
        description: 'キッチン用品、家具、インテリア',
        imageUrl:
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop',
      },
    }),
    prisma.category.create({
      data: {
        name: 'スポーツ・アウトドア',
        slug: 'sports',
        description: 'スポーツ用品、アウトドアグッズ',
        imageUrl:
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
      },
    }),
  ]);

  console.log(`${categories.length}個のカテゴリを作成しました`);

  // 商品を作成
  const products = [
    // 家電・PC
    {
      name: 'MacBook Pro 14インチ',
      description:
        'Apple M3 Proチップ搭載の高性能ノートパソコン。プロフェッショナル向けの作業に最適です。',
      price: 298000,
      comparePrice: 318000,
      sku: 'MBP-14-M3P-001',
      stock: 15,
      status: 'ACTIVE' as const,
      categoryId: categories[0].id,
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&h=400&fit=crop',
      ],
    },
    {
      name: 'iPhone 15 Pro',
      description:
        'チタニウムデザインとA17 Proチップで、革新的な体験を提供します。',
      price: 159800,
      comparePrice: null,
      sku: 'IP15P-128-TIT',
      stock: 25,
      status: 'ACTIVE' as const,
      categoryId: categories[0].id,
      images: [
        'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&h=400&fit=crop',
      ],
    },
    {
      name: 'ワイヤレスイヤホン',
      description: 'ノイズキャンセリング機能付きの高音質ワイヤレスイヤホン。',
      price: 24800,
      comparePrice: 29800,
      sku: 'WE-NC-001',
      stock: 50,
      status: 'ACTIVE' as const,
      categoryId: categories[0].id,
      images: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=400&fit=crop',
      ],
    },
    // ファッション
    {
      name: 'カシミヤセーター',
      description:
        '上質なカシミヤ100%のセーター。柔らかな着心地と優雅なシルエット。',
      price: 45000,
      comparePrice: 52000,
      sku: 'CS-100-GRY-M',
      stock: 20,
      status: 'ACTIVE' as const,
      categoryId: categories[1].id,
      images: [
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=400&fit=crop',
      ],
    },
    {
      name: 'レザーブーツ',
      description: '本革製の高品質ブーツ。長時間の歩行でも疲れにくい設計。',
      price: 28000,
      comparePrice: null,
      sku: 'LB-BRN-26',
      stock: 12,
      status: 'ACTIVE' as const,
      categoryId: categories[1].id,
      images: [
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=400&fit=crop',
      ],
    },
    // 本・雑誌
    {
      name: 'プログラミング入門書',
      description:
        '初心者向けのわかりやすいプログラミング学習書。実践的な例題付き。',
      price: 3200,
      comparePrice: null,
      sku: 'BOOK-PROG-001',
      stock: 100,
      status: 'ACTIVE' as const,
      categoryId: categories[2].id,
      images: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=400&fit=crop',
      ],
    },
    // ホーム・キッチン
    {
      name: 'ホーロー鍋セット',
      description:
        '煮込み料理に最適なホーロー鍋3点セット。熱分布が均一で美味しく調理できます。',
      price: 15800,
      comparePrice: 18000,
      sku: 'EP-SET-3PC',
      stock: 30,
      status: 'ACTIVE' as const,
      categoryId: categories[3].id,
      images: [
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop',
      ],
    },
    {
      name: 'コーヒーメーカー',
      description:
        '全自動ドリップコーヒーメーカー。挽きたての香り豊かなコーヒーを楽しめます。',
      price: 12000,
      comparePrice: null,
      sku: 'CM-AUTO-001',
      stock: 25,
      status: 'ACTIVE' as const,
      categoryId: categories[3].id,
      images: [
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop',
      ],
    },
    // スポーツ・アウトドア
    {
      name: 'ヨガマット',
      description:
        '滑り止め加工の高品質ヨガマット。クッション性があり快適です。',
      price: 4800,
      comparePrice: 5800,
      sku: 'YM-PRO-BLU',
      stock: 40,
      status: 'ACTIVE' as const,
      categoryId: categories[4].id,
      images: [
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop',
      ],
    },
    {
      name: 'ランニングシューズ',
      description: '軽量で通気性の良いランニングシューズ。長距離ランにも対応。',
      price: 18000,
      comparePrice: null,
      sku: 'RS-LGT-26-BLK',
      stock: 35,
      status: 'ACTIVE' as const,
      categoryId: categories[4].id,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop',
      ],
    },
  ];

  for (const productData of products) {
    const { images, ...product } = productData;
    const createdProduct = await prisma.product.create({
      data: product,
    });

    // 商品画像を作成
    if (images) {
      await Promise.all(
        images.map((url, index) =>
          prisma.productImage.create({
            data: {
              url,
              alt: `${product.name} - 画像${index + 1}`,
              order: index,
              productId: createdProduct.id,
            },
          })
        )
      );
    }

    console.log(`商品「${product.name}」を作成しました`);
  }

  console.log('シードデータの作成が完了しました！');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
