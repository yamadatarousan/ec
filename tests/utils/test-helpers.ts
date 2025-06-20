import { render, RenderOptions } from '@testing-library/react';
import React, { ReactElement } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { ProductStatus } from '@/types/product';

// Mock router context
const MockRouterContext = ({ children }: { children: React.ReactNode }) => {
  return React.createElement('div', {}, children);
};

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(
    MockRouterContext,
    { children },
    React.createElement(AuthProvider, {
      children: React.createElement(CartProvider, { children }),
    })
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Mock user data for testing
export const mockUser = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  role: 'CUSTOMER' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockAdmin = {
  id: 'test-admin-id',
  name: 'Test Admin',
  email: 'admin@example.com',
  role: 'ADMIN' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock product data
export const mockProduct = {
  id: 'test-product-id',
  name: 'Test Product',
  description: 'This is a test product',
  price: 1000,
  comparePrice: 1200,
  sku: 'TEST-SKU-001',
  stock: 10,
  status: ProductStatus.ACTIVE,
  categoryId: 'test-category-id',
  weight: 100,
  dimensions: JSON.stringify({ width: 10, height: 20, depth: 5 }),
  tags: ['test', 'product'],
  createdAt: new Date(),
  updatedAt: new Date(),
  images: [
    {
      id: 'test-image-id',
      url: '/test-image.jpg',
      alt: 'Test Image',
      order: 0,
      productId: 'test-product-id',
      createdAt: new Date(),
    },
  ],
  category: {
    id: 'test-category-id',
    name: 'Test Category',
    slug: 'test-category',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  reviews: [],
};

// Mock order data
export const mockOrder = {
  id: 'test-order-id',
  orderNumber: 'ORDER-001',
  userId: 'test-user-id',
  status: 'PENDING' as const,
  totalAmount: 1000,
  shippingCost: 100,
  taxAmount: 80,
  addressId: 'test-address-id',
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [
    {
      id: 'test-order-item-id',
      productId: 'test-product-id',
      quantity: 1,
      price: 1000,
      orderId: 'test-order-id',
      product: mockProduct,
    },
  ],
};

// API response helpers
export const createMockApiResponse = <T>(data: T, success = true) => ({
  success,
  data,
  ...(success ? {} : { error: 'Test error message' }),
});

// Test utilities for async operations
export const waitForApiCall = () =>
  new Promise(resolve => setTimeout(resolve, 100));

// Mock fetch response
export const createMockFetchResponse = <T>(data: T, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data),
  headers: new Headers(),
  url: 'http://localhost:3000/api/test',
  type: 'cors' as ResponseType,
  redirected: false,
  statusText: status === 200 ? 'OK' : 'Error',
  body: null,
  bodyUsed: false,
  clone: jest.fn(),
  arrayBuffer: jest.fn(),
  blob: jest.fn(),
  formData: jest.fn(),
});

// Local storage test helpers
export const mockLocalStorage = {
  clear: () => {
    (global.localStorage.clear as jest.Mock).mockClear();
  },
  getItem: (key: string) => {
    return (global.localStorage.getItem as jest.Mock).mockReturnValue(null);
  },
  setItem: (key: string, value: string) => {
    return (global.localStorage.setItem as jest.Mock).mockImplementation(
      () => {}
    );
  },
  removeItem: (key: string) => {
    return (global.localStorage.removeItem as jest.Mock).mockImplementation(
      () => {}
    );
  },
};
