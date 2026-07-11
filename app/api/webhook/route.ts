import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import stripe from "@/lib/stripe";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function admin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Server configuration is incomplete");
  return createAdminClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function subscriptionState(subscription: Stripe.Subscription) {
  return ["active", "trialing"].includes(subscription.status);
}

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) return NextResponse.json({ error: "Invalid webhook request" }, { status: 400 });
  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(await request.text(), signature, secret); }
  catch { return NextResponse.json({ error: "Invalid signature" }, { status: 400 }); }

  const supabase = admin();
  const { error: claimed } = await supabase.from("billing_events").insert({
    stripe_event_id: event.id, event_type: event.type, created_at: new Date(event.created * 1000).toISOString(), payload: event,
  });
  if (claimed?.code === "23505") return NextResponse.json({ received: true, replay: true });
  if (claimed) return NextResponse.json({ error: "Could not record webhook" }, { status: 500 });

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
      if (!userId || !customerId) throw new Error("Checkout session is missing account metadata");
      await supabase.from("customer").upsert({ id: customerId, user_id: userId }, { onConflict: "id" });
      await supabase.from("profile").update({ is_subscribed: true, sets_remaining: 5, chats_remaining: 100 }).eq("id", userId);
    }
    if (["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"].includes(event.type)) {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
      const { data: customer, error } = await supabase.from("customer").select("user_id").eq("id", customerId).single();
      if (error || !customer) throw new Error("Unknown Stripe customer");
      const active = event.type !== "customer.subscription.deleted" && subscriptionState(subscription);
      await supabase.from("profile").update({ is_subscribed: active, sets_remaining: active ? 5 : 1, chats_remaining: active ? 100 : 10 }).eq("id", customer.user_id);
    }
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
      if (customerId) {
        const { data: customer } = await supabase.from("customer").select("user_id").eq("id", customerId).maybeSingle();
        if (customer) await supabase.from("profile").update({ is_subscribed: false, sets_remaining: 1, chats_remaining: 10 }).eq("id", customer.user_id);
      }
    }
  } catch (error) {
    console.error("Webhook processing failed", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
