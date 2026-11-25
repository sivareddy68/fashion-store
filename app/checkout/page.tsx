
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2, ShoppingBag } from "lucide-react";
import { useCart } from "../../context/CartContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, hydrated, clearCart } = useCart();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successOrder, setSuccessOrder] = useState("");

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  function updateField(field: keyof typeof form, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function placeOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (cart.length === 0) {
      setError("Your shopping bag is empty.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      setError("Enter a valid 6-digit PIN code.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            fullName: form.fullName.trim(),
            phone: form.phone.trim(),
            email: form.email.trim(),
          },
          address: {
            address: form.address.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            pincode: form.pincode.trim(),
            country: "India",
          },
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to place your order.");
      }

      clearCart();
      setSuccessOrder(String(result.orderNumber));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-[#f7f5f0] p-10 text-center">
        Loading checkout...
      </main>
    );
  }

  if (successOrder) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f5f0] px-5 text-[#171614]">
        <div className="w-full max-w-lg bg-white p-10 text-center">
          <CheckCircle2 className="mx-auto mb-6 text-green-700" size={48} />
          <p className="text-[10px] tracking-[3px] text-[#a17b55]">
            ATELIER ORDER CONFIRMED
          </p>
          <h1 className="mt-4 font-serif text-4xl">Thank you.</h1>
          <p className="mt-4 text-sm text-black/60">
            Your order has been placed successfully.
          </p>
          <p className="mt-5 text-sm">
            Order number: <strong>#{successOrder}</strong>
          </p>
          <p className="mt-3 text-xs text-black/50">
            Payment method: Cash on Delivery
          </p>
          <Link
            href="/"
            className="mt-9 inline-block rounded-full bg-[#171614] px-9 py-4 text-[10px] tracking-[2px] text-white"
          >
            CONTINUE SHOPPING
          </Link>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#f7f5f0] px-5 text-center">
        <ShoppingBag size={40} className="mb-5 text-[#a17b55]" />
        <h1 className="font-serif text-3xl">Your bag is empty.</h1>
        <Link href="/#shop" className="mt-7 text-xs tracking-widest underline">
          EXPLORE COLLECTION
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] px-5 py-10 text-[#171614] md:px-12">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-xs tracking-widest"
        >
          <ArrowLeft size={16} /> BACK TO BAG
        </Link>

        <div className="mt-12 border-b border-black/15 pb-6">
          <p className="mb-3 text-[10px] tracking-[3px] text-[#a17b55]">
            ALMOST YOURS
          </p>
          <h1 className="font-serif text-5xl">Checkout.</h1>
        </div>

        <form
          onSubmit={placeOrder}
          className="grid gap-12 py-10 lg:grid-cols-[1fr_360px]"
        >
          <div className="space-y-10">
            <section>
              <h2 className="font-serif text-2xl">Contact information.</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field
                  label="FULL NAME"
                  value={form.fullName}
                  onChange={(v) => updateField("fullName", v)}
                  required
                />
                <Field
                  label="MOBILE NUMBER"
                  value={form.phone}
                  onChange={(v) => updateField("phone", v)}
                  type="tel"
                  required
                  maxLength={10}
                />
                <div className="sm:col-span-2">
                  <Field
                    label="EMAIL ADDRESS (OPTIONAL)"
                    value={form.email}
                    onChange={(v) => updateField("email", v)}
                    type="email"
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-serif text-2xl">Delivery address.</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field
                    label="HOUSE / STREET / AREA"
                    value={form.address}
                    onChange={(v) => updateField("address", v)}
                    required
                  />
                </div>
                <Field
                  label="CITY"
                  value={form.city}
                  onChange={(v) => updateField("city", v)}
                  required
                />
                <Field
                  label="STATE"
                  value={form.state}
                  onChange={(v) => updateField("state", v)}
                  required
                />
                <Field
                  label="PIN CODE"
                  value={form.pincode}
                  onChange={(v) => updateField("pincode", v)}
                  required
                  maxLength={6}
                />
              </div>
            </section>

            <section>
              <h2 className="font-serif text-2xl">Payment method.</h2>
              <div className="mt-5 border border-[#a17b55] bg-white p-5">
                <p className="text-sm font-medium">Cash on Delivery</p>
                <p className="mt-2 text-xs text-black/50">
                  Pay when your order is delivered to your address.
                </p>
              </div>
            </section>

            {error && (
              <p className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#171614] px-6 py-5 text-[10px] tracking-[2px] text-white transition hover:bg-[#a17b55] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={15} className="animate-spin" />
                  PLACING ORDER...
                </span>
              ) : (
                "PLACE ORDER — CASH ON DELIVERY"
              )}
            </button>
          </div>

          <aside className="h-fit bg-[#eeece6] p-7">
            <h2 className="font-serif text-2xl">Your order.</h2>

            <div className="mt-7 space-y-5">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.size}-${item.color}`}
                  className="flex gap-4"
                >
                  <div className="h-20 w-16 shrink-0 bg-[#e5e1d9]">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{item.name}</p>
                    <p className="mt-1 text-xs text-black/50">
                      Size: {item.size} · Colour: {item.color}
                    </p>
                    <p className="mt-1 text-xs text-black/50">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <p className="whitespace-nowrap text-sm">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-7 flex justify-between border-t border-black/15 pt-5 text-sm">
              <span className="text-black/55">Subtotal</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-black/55">Shipping</span>
              <span>Confirmed before dispatch</span>
            </div>
            <div className="mt-6 flex justify-between border-t border-black/15 pt-6 text-base">
              <span>Total</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <p className="mt-5 text-center text-[10px] leading-5 text-black/50">
              Cash on Delivery · No online payment required
            </p>
          </aside>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] tracking-[1.5px] text-black/55">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        maxLength={maxLength}
        className="w-full border border-black/20 bg-transparent px-4 py-4 text-sm outline-none transition focus:border-[#a17b55]"
      />
    </label>
  );
}
