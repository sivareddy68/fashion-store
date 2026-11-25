
"use client";

import Link from "next/link";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "../../context/CartContext";

export default function CartPage() {
  const {
    cart,
    cartCount,
    updateQuantity,
    removeFromCart,
    hydrated,
  } = useCart();

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-[#f7f5f0] p-10 text-center">
        Loading your bag...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] px-5 py-10 text-[#171614] md:px-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="inline-flex items-center gap-2 text-xs tracking-widest">
          <ArrowLeft size={16} /> CONTINUE SHOPPING
        </Link>

        <div className="mt-12 flex items-end justify-between border-b border-black/15 pb-6">
          <div>
            <p className="mb-3 text-[10px] tracking-[3px] text-[#a17b55]">YOUR SELECTION</p>
            <h1 className="font-serif text-5xl">Shopping bag.</h1>
          </div>
          <p className="text-xs text-black/50">{cartCount} ITEMS</p>
        </div>

        {cart.length === 0 ? (
          <div className="py-28 text-center">
            <ShoppingBag size={38} className="mx-auto mb-6 text-[#a17b55]" />
            <h2 className="font-serif text-3xl">Your bag is waiting.</h2>
            <p className="mt-3 text-sm text-black/50">
              Discover something you love and add it to your collection.
            </p>
            <Link
              href="/#shop"
              className="mt-8 inline-flex rounded-full bg-[#171614] px-8 py-4 text-[10px] tracking-[2px] text-white transition hover:bg-[#a17b55]"
            >
              EXPLORE THE COLLECTION
            </Link>
          </div>
        ) : (
          <div className="grid gap-12 py-10 lg:grid-cols-[1fr_350px]">
            <div className="space-y-7">
              {cart.map((item) => (
                <article
                  key={`${item.id}-${item.size}-${item.color}`}
                  className="flex gap-5 border-b border-black/10 pb-7"
                >
                  <div className="h-36 w-28 shrink-0 bg-[#e5e1d9] sm:h-44 sm:w-36">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <div className="flex justify-between gap-3">
                        <h2 className="text-sm">{item.name}</h2>
                        <p className="whitespace-nowrap text-sm">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <p className="mt-2 text-xs text-black/50">Size: {item.size}</p>
                      <p className="mt-1 text-xs text-black/50">Colour: {item.color}</p>
                      <p className="mt-1 text-xs text-black/50">
                        ₹{item.price.toLocaleString("en-IN")} each
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center border border-black/20">
                        <button
                          aria-label="Decrease quantity"
                          onClick={() =>
                            updateQuantity(item.id, item.size, item.color, item.quantity - 1)
                          }
                          className="p-2"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={13} />
                        </button>
                        <span className="min-w-8 text-center text-xs">{item.quantity}</span>
                        <button
                          aria-label="Increase quantity"
                          onClick={() =>
                            updateQuantity(item.id, item.size, item.color, item.quantity + 1)
                          }
                          className="p-2"
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id, item.size, item.color)}
                        className="inline-flex items-center gap-2 text-[10px] tracking-wider text-black/50 hover:text-red-700"
                      >
                        <Trash2 size={14} /> REMOVE
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="h-fit bg-[#eeece6] p-7">
              <h2 className="font-serif text-2xl">Order summary.</h2>
              <div className="mt-7 flex justify-between border-b border-black/15 pb-5 text-sm">
                <span className="text-black/55">Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between border-b border-black/15 py-5 text-sm">
                <span className="text-black/55">Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between py-6 text-base">
                <span>Total</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <Link
                href="/checkout"
                className="block rounded-full bg-[#171614] px-6 py-4 text-center text-[10px] tracking-[2px] text-white transition hover:bg-[#a17b55]"
              >
                PROCEED TO CHECKOUT
              </Link>
              <p className="mt-5 text-center text-[10px] leading-5 text-black/50">
                Cash on Delivery available. Shipping charges, if any, will be confirmed before order placement.
              </p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}