import { NextRequest, NextResponse } from 'next/server';
import {
  sendOrderConfirmationEmail,
  sendInventoryAlertEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from '@/lib/services/email';
import {
  OrderConfirmationData,
  InventoryAlertData,
  PasswordResetData,
  WelcomeEmailData,
} from '@/lib/email/templates';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, to, data } = body;

    if (!type || !to || !data) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    let result: { success: boolean; messageId?: string; error?: string };

    switch (type) {
      case 'order_confirmation':
        if (!isOrderConfirmationData(data)) {
          return NextResponse.json(
            { success: false, error: 'Invalid order confirmation data' },
            { status: 400 }
          );
        }
        result = await sendOrderConfirmationEmail(to, data);
        break;

      case 'inventory_alert':
        if (!isInventoryAlertData(data)) {
          return NextResponse.json(
            { success: false, error: 'Invalid inventory alert data' },
            { status: 400 }
          );
        }
        result = await sendInventoryAlertEmail(to, data);
        break;

      case 'password_reset':
        if (!isPasswordResetData(data)) {
          return NextResponse.json(
            { success: false, error: 'Invalid password reset data' },
            { status: 400 }
          );
        }
        result = await sendPasswordResetEmail(to, data);
        break;

      case 'welcome':
        if (!isWelcomeEmailData(data)) {
          return NextResponse.json(
            { success: false, error: 'Invalid welcome email data' },
            { status: 400 }
          );
        }
        result = await sendWelcomeEmail(to, data);
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid email type' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

// データバリデーション関数
function isOrderConfirmationData(data: any): data is OrderConfirmationData {
  return (
    data &&
    typeof data.orderNumber === 'string' &&
    typeof data.customerName === 'string' &&
    typeof data.customerEmail === 'string' &&
    Array.isArray(data.items) &&
    typeof data.totalAmount === 'number' &&
    typeof data.shippingCost === 'number' &&
    typeof data.taxAmount === 'number' &&
    data.shippingAddress &&
    typeof data.shippingAddress.name === 'string' &&
    typeof data.shippingAddress.address1 === 'string' &&
    typeof data.shippingAddress.city === 'string' &&
    typeof data.shippingAddress.state === 'string' &&
    typeof data.shippingAddress.zipCode === 'string' &&
    data.orderDate instanceof Date || typeof data.orderDate === 'string'
  );
}

function isInventoryAlertData(data: any): data is InventoryAlertData {
  return (
    data &&
    typeof data.productName === 'string' &&
    typeof data.productSku === 'string' &&
    typeof data.currentStock === 'number' &&
    typeof data.threshold === 'number' &&
    typeof data.categoryName === 'string'
  );
}

function isPasswordResetData(data: any): data is PasswordResetData {
  return (
    data &&
    typeof data.customerName === 'string' &&
    typeof data.resetLink === 'string' &&
    (data.expiresAt instanceof Date || typeof data.expiresAt === 'string')
  );
}

function isWelcomeEmailData(data: any): data is WelcomeEmailData {
  return (
    data &&
    typeof data.customerName === 'string' &&
    typeof data.customerEmail === 'string'
  );
}