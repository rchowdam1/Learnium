import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import Stripe from "stripe";
import stripe from "@/lib/stripe";

//const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.log("User is not logged in");
    return NextResponse.json(
      { error: "User is not logged in" },
      { status: 400 }
    );
  }

  // create a new checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      },
    ],
    customer_email: user?.email ?? "",
    mode: "subscription",
    metadata: { userId: user?.id },
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/subscriptions`,
  });

  return NextResponse.json({ url: session.url }, { status: 200 });
}
