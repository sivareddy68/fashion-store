
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
  try {
    // Check server configuration
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Server configuration is incomplete." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { customer, address, items } = body;

    // Validate required fields
    if (
      !customer?.fullName ||
      !customer?.phone ||
      !address?.address ||
      !address?.city ||
      !address?.state ||
      !address?.pincode ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Please provide all required checkout details." },
        { status: 400 }
      );
    }

    // Validate customer details
    if (
      typeof customer.fullName !== "string" ||
      customer.fullName.trim().length > 100 ||
      typeof customer.phone !== "string" ||
      !/^[6-9]\d{9}$/.test(customer.phone.trim()) ||
      (customer.email &&
        (typeof customer.email !== "string" ||
          customer.email.length > 254 ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)))
    ) {
      return NextResponse.json(
        { error: "Please enter valid customer details." },
        { status: 400 }
      );
    }

    // Validate address
    if (
      typeof address.address !== "string" ||
      address.address.trim().length > 300 ||
      typeof address.city !== "string" ||
      address.city.trim().length > 100 ||
      typeof address.state !== "string" ||
      address.state.trim().length > 100 ||
      typeof address.pincode !== "string" ||
      !/^\d{6}$/.test(address.pincode.trim())
    ) {
      return NextResponse.json(
        { error: "Please enter a valid delivery address." },
        { status: 400 }
      );
    }

    // Validate cart items
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (
      items.length > 50 ||
      items.some(
        (item: {
          productId?: unknown;
          quantity?: unknown;
          size?: unknown;
          color?: unknown;
        }) =>
          typeof item.productId !== "string" ||
          !uuidRegex.test(item.productId) ||
          !Number.isInteger(item.quantity) ||
          (item.quantity as number) < 1 ||
          (item.quantity as number) > 100 ||
          typeof item.size !== "string" ||
          typeof item.color !== "string" ||
          item.size.length > 50 ||
          item.color.length > 50
      )
    ) {
      return NextResponse.json(
        { error: "Invalid cart information." },
        { status: 400 }
      );
    }

    // Create server-side Supabase client
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Call secure database function
    const { data, error } = await supabase.rpc("place_cod_order", {
      p_customer: {
        fullName: customer.fullName.trim(),
        phone: customer.phone.trim(),
        email: customer.email?.trim() || "",
      },
      p_address: {
        address: address.address.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        pincode: address.pincode.trim(),
        country: "India",
      },
      p_items: items.map((item: {
        productId: string;
        quantity: number;
        size: string;
        color: string;
      }) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
    });

    if (error) {
      console.error("Order placement error:", error.message);

      return NextResponse.json(
        {
          error:
            "Unable to place your order. Please check product availability and try again.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        orderNumber: data,
        message: "Your COD order has been placed successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Checkout API error:", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
