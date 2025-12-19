import Razorpay from "razorpay";
import { BasePaymentGateway } from "../base-payment-gateway";
import { CheckoutSession, CreateCheckoutParams, PaymentGatewayConfig, WebhookEvent } from "../types";
import crypto from "crypto";

export class RazorpayGateway extends BasePaymentGateway {
    private razorpay: Razorpay;
    constructor(config: PaymentGatewayConfig) {
        super(config);
        this.razorpay = new Razorpay({
            key_id: config.apiKey,
            key_secret: config.apiSecret || "",
        });
    }

    async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSession> {
        const currency = params.currency.toUpperCase();
        const amount = Math.max(params.amount, 100); // Razorpay minimum amount is 100 (1 INR)
        
        // Create Razorpay order
        const order = await this.razorpay.orders.create({
            amount: amount * 100, // Razorpay expects amount in paise (smallest currency unit)
            currency: currency,
            receipt: `receipt_${Date.now()}`,
            notes: params.metadata || {},
        });

        // Include planId in the checkout URL if provided in metadata
        const planId = params.metadata?.planId;
        const checkoutUrl = planId 
            ? `/checkout/razorpay?order_id=${order.id}&planId=${planId}`
            : `/checkout/razorpay?order_id=${order.id}`;

        return {
            id: order.id,
            url: checkoutUrl,
            gateway: 'razorpay',
        };
    }

    async verifyWebhook(payload: any, signature: string): Promise<WebhookEvent> {
        if (!this.config.webhookSecret) {
            throw new Error('Webhook secret not configured');
        }

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac('sha256', this.config.webhookSecret)
            .update(JSON.stringify(payload))
            .digest('hex');

        if (expectedSignature !== signature) {
            throw new Error('Invalid webhook signature');
        }

        return {
            type: payload.event,
            data: payload.payload,
            gateway: 'razorpay',
        };
    }

    async createCustomer(email: string, name?: string): Promise<string> {
        const customer = await this.razorpay.customers.create({
            email,
            name: name || email,
        });

        return customer.id;
    }

    async cancelSubscription(subscriptionId: string): Promise<void> {
        await this.razorpay.subscriptions.cancel(subscriptionId);
    }

    async getSubscription(subscriptionId: string): Promise<any> {
        const subscription = await this.razorpay.subscriptions.fetch(subscriptionId);
        return subscription;
    }

    /**
     * Fetch payment details from Razorpay
     * Used for payment verification
     */
    async fetchPayment(paymentId: string): Promise<any> {
        const payment = await this.razorpay.payments.fetch(paymentId);
        return payment;
    }

    /**
     * Get the Razorpay instance (for direct access if needed)
     */
    getRazorpayInstance(): Razorpay {
        return this.razorpay;
    }
}