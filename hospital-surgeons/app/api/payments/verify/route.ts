import { NextRequest, NextResponse } from 'next/server';
import { paymentManager } from '@/app/api/lib/payment-gate-ways/payment-gateway-manager';
import { RazorpayGateway } from '@/app/api/lib/payment-gate-ways/gatways/razorpay';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing payment details' },
        { status: 400 }
      );
    }

    const gateway = paymentManager.getGateway('razorpay') as RazorpayGateway;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return NextResponse.json(
        { success: false, error: 'Razorpay key secret not configured' },
        { status: 500 }
      );
    }

    // Verify the signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');

    const isSignatureValid = generatedSignature === razorpay_signature;

    if (!isSignatureValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Fetch payment details from Razorpay
    try {
      const payment = await gateway.fetchPayment(razorpay_payment_id);
      
      console.log('Payment verified:', {
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        status: payment.status,
        amount: payment.amount,
      });

      return NextResponse.json({
        success: true,
        payment: {
          id: payment.id,
          order_id: payment.order_id,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          method: payment.method,
        },
      });
    } catch (error: any) {
      console.error('Error fetching payment from Razorpay:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch payment details' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}


