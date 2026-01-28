import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import Stripe from "stripe";
import stripe from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("Received event: ", event.type);

  return NextResponse.json({ received: true }, { status: 200 });
}
