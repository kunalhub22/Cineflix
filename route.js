import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "../../../lib/stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Webhook is not configured" }, { status: 503 });
  }
  const body = await request.text();
  const signature = headers().get("stripe-signature");
  let event;
  try { event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET); }
  catch (err) { return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 }); }
  // Production note: map Stripe customer IDs to authenticated user IDs at checkout
  // and persist subscription status. This starter deliberately does not grant access
  // from an unverified client-side success redirect.
  if (["customer.subscription.created","customer.subscription.updated","customer.subscription.deleted"].includes(event.type)) {
    const sub = event.data.object;
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    await admin.from("billing_events").upsert({ stripe_event_id:event.id, event_type:event.type, stripe_customer_id:String(sub.customer), subscription_status:sub.status }, { onConflict:"stripe_event_id" });
  }
  return NextResponse.json({ received: true });
}
