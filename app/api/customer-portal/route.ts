import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import Stripe from "stripe";
import stripe from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.log("User is not logged in");
    return NextResponse.json(
      { error: "User is not logged in" },
      { status: 401 }
    );
  }

  // get the user id and check if it exists in the customer table
  const { data: customer, error: customerError } = await supabase
    .from("customer")
    .select("*")
    .eq("user_id", user?.id)
    .single();

  if (customerError) {
    return NextResponse.json({ error: "Customer not found" }, { status: 200 });
  }

  // the customer exists
  // create the portal

  const session = await stripe.billingPortal.sessions.create({
    customer: customer.id,
    return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
  });

  return NextResponse.json({ url: session.url }, { status: 200 });
}
