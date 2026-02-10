// Stripe integration for Project X
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// Create a payment link
async function createPaymentLink() {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'AI Automation Setup',
            description: 'Custom AI automation for your business',
          },
          unit_amount: 200000, // $2,000 in cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://atxaisolutions.net/success',
      cancel_url: 'https://atxaisolutions.net/cancel',
    });
    
    console.log('Payment link created:', session.url);
    return session.url;
  } catch (error) {
    console.error('Error creating payment link:', error);
  }
}

// Create subscription
async function createSubscription() {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'AI Automation - Monthly Retainer',
            description: 'Ongoing automation support and maintenance',
          },
          unit_amount: 100000, // $1,000 in cents
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: 'https://atxaisolutions.net/success',
      cancel_url: 'https://atxaisolutions.net/cancel',
    });
    
    console.log('Subscription link created:', session.url);
    return session.url;
  } catch (error) {
    console.error('Error creating subscription:', error);
  }
}

module.exports = { createPaymentLink, createSubscription };
