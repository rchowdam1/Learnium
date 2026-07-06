import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import type Stripe from "stripe";
import stripe from "@/lib/stripe";

//const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.log("User is not logged in");
    return NextResponse.json(
      { error: "User is not logged in" },
      { status: 400 }
    );
  }

  const price = process.env.STRIPE_PRICE_ID;
  if (!price) {
    return NextResponse.json(
      { error: "Stripe price is not configured" },
      { status: 500 }
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // create a new checkout session
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ["card"],
    line_items: [
      {
        price,
        quantity: 1,
      },
    ],
    customer_email: user.email,
    mode: "subscription",
    metadata: { userId: user.id },
    success_url: `${siteUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/subscriptions`,
  };
  const session = await stripe.checkout.sessions.create(sessionParams);

  return NextResponse.json({ url: session.url }, { status: 200 });
}
