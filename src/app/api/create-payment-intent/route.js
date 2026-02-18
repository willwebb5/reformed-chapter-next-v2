// app/api/create-payment-intent/route.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { amount, currency = 'usd', metadata = {} } = await request.json();

    console.log('Creating payment intent for:', { amount, currency, metadata });

    if (!amount || amount < 50) {
      return Response.json(
        { error: { message: 'Amount must be at least $0.50' } },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        ...metadata,
        source: 'reformed-chapter-donation',
      },
      automatic_payment_methods: { enabled: true },
    });

    console.log('Payment intent created:', paymentIntent.id);

    return Response.json({
      client_secret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return Response.json(
      { error: { message: error.message || 'Failed to create payment intent' } },
      { status: 500 }
    );
  }
}