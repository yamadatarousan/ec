import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render, mockProduct } from '../utils/test-helpers';
import { ProductCard } from '@/components/features/ProductCard';
import { ProductStatus } from '@/types/product';

// Mock the cart context
const mockAddToCart = jest.fn();
jest.mock('@/contexts/CartContext', () => ({
  useCart: () => ({
    addToCart: mockAddToCart,
    cartItems: [],
    cartCount: 0,
    cartTotal: 0,
    updateQuantity: jest.fn(),
    removeFromCart: jest.fn(),
    clearCart: jest.fn(),
    refreshCart: jest.fn(),
  }),
}));

describe('ProductCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('商品情報が正しく表示される', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
    expect(screen.getByText('¥1,000')).toBeInTheDocument();
    expect(screen.getByText('¥1,200')).toBeInTheDocument(); // comparePrice
  });

  it('商品画像が正しく表示される', () => {
    render(<ProductCard product={mockProduct} />);

    const image = screen.getByRole('img', { name: mockProduct.images[0].alt });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockProduct.images[0].url);
  });

  it('カートに追加ボタンが機能する', async () => {
    render(<ProductCard product={mockProduct} />);

    const addToCartButton = screen.getByRole('button', {
      name: /カートに追加/i,
    });
    expect(addToCartButton).toBeInTheDocument();

    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith(mockProduct.id, 1);
    });
  });

  it('在庫がない場合、カートに追加ボタンが無効化される', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    render(<ProductCard product={outOfStockProduct} />);

    const addToCartButton = screen.getByRole('button', {
      name: /カートに追加/i,
    });
    expect(addToCartButton).toBeDisabled();
  });

  it('商品詳細ページへのリンクが正しい', () => {
    render(<ProductCard product={mockProduct} />);

    const productLink = screen.getByRole('link');
    expect(productLink).toHaveAttribute('href', `/products/${mockProduct.id}`);
  });

  it('お気に入りボタンが表示される', () => {
    render(<ProductCard product={mockProduct} />);

    const favoriteButton = screen.getByRole('button', { name: /お気に入り/i });
    expect(favoriteButton).toBeInTheDocument();
  });

  it('商品ステータスが非アクティブの場合、適切に表示される', () => {
    const inactiveProduct = { ...mockProduct, status: ProductStatus.INACTIVE };
    render(<ProductCard product={inactiveProduct} />);

    expect(screen.getByText(/販売終了/i)).toBeInTheDocument();
  });

  it('セール価格が表示される', () => {
    const saleProduct = { ...mockProduct, comparePrice: 1500 };
    render(<ProductCard product={saleProduct} />);

    // セール割引率の計算: (1500 - 1000) / 1500 * 100 = 33%
    expect(screen.getByText(/33%/i)).toBeInTheDocument();
  });
});
