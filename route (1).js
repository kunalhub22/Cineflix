import { NextResponse } from "next/server";
import { stripe } from "../../../lib/stripe";

export async function POST() {
  if (!stripe || !process.env.STRIPE_PREMIUM_PRICE_ID || !process.env.NEXT_PUBLIC_SITE_URL) {
    return NextResponse.json({ error: "Stripe is not configured. Add the Stripe keys, Price ID, and site URL to your environment." }, { status: 503 });
  }
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PREMIUM_PRICE_ID, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/premium?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/premium?canceled=true`,
  });
  return NextResponse.json({ url: session.url });
}
