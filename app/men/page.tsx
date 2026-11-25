
"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ShoppingBag,
  X,
  Check,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[] | null;
  stock: number;
  sizes: string[] | null;
  colors: string[] | null;
  categories: { name: string; slug: string } | null;
};

const categories = [
  "All",
  "Shirts",
  "Pants",
  "T-Shirts",
  "Jeans",
  "Hoodies",
];

function getCategory(product: Product) {
  return (
    product.categories?.name?.toLowerCase().replace(/[^a-z]/g, "") || ""
  );
}

function matchesCategory(product: Product, filter: string) {
  const category = getCategory(product);

  if (filter === "All") {
    return [
      "men",
      "shirt",
      "shirts",
      "pant",
      "pants",
      "trouser",
      "trousers",
      "tshirt",
      "tshirts",
      "jean",
      "jeans",
      "hoodie",
      "hoodies",
    ].includes(category);
  }

  const aliases: Record<string, string[]> = {
    Shirts: ["shirt", "shirts", "mensshirt"],
    Pants: ["pant", "pants", "trouser", "trousers"],
    "T-Shirts": ["tshirt", "tshirts"],
    Jeans: ["jean", "jeans"],
    Hoodies: ["hoodie", "hoodies"],
  };

  return aliases[filter]?.includes(category) ?? false;
}

export default function MenPage() {
  const { addToCart, cartCount } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [imageIndex, setImageIndex] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select(
          "id,name,description,price,images,stock,sizes,colors,categories(name,slug)"
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        setError("Unable to load products. Please refresh the page.");
        setProducts([]);
      } else {
        setProducts((data ?? []) as unknown as Product[]);
      }

      setLoading(false);
    }

    loadProducts();
  }, []);

  const filteredProducts = useMemo(
    () => products.filter((product) => matchesCategory(product, activeCategory)),
    [products, activeCategory]
  );

  function openProduct(product: Product) {
    setSelectedProduct(product);
    setSelectedSize(product.sizes?.[0] || "One Size");
    setSelectedColor(product.colors?.[0] || "Default");
    setImageIndex(0);
    setAdded(false);
  }

  function handleAddToCart() {
    if (!selectedProduct || selectedProduct.stock < 1) return;

    addToCart({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: Number(selectedProduct.price),
      image: selectedProduct.images?.[0] || "",
      size: selectedSize,
      color: selectedColor,
      stock: selectedProduct.stock,
    });

    setAdded(true);
  }

  const productImages = selectedProduct?.images?.filter(Boolean) || [];
  const availableSizes = selectedProduct?.sizes?.length
    ? selectedProduct.sizes
    : ["One Size"];
  const availableColors = selectedProduct?.colors?.length
    ? selectedProduct.colors
    : ["Default"];

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#171715]">
      {/* NAVIGATION */}
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f8f7f4]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-5 md:px-12">
          <Link href="/" className="text-xl font-semibold tracking-[0.25em]">
            ATELIER.
          </Link>

          <nav className="hidden items-center gap-10 text-[11px] uppercase tracking-[0.2em] md:flex">
            <Link href="/" className="transition hover:opacity-50">
              Home
            </Link>
            <a href="#collection" className="transition hover:opacity-50">
              Catalog
            </a>
            <a href="#footer" className="transition hover:opacity-50">
              Contact
            </a>
          </nav>

          <Link
            href="/cart"
            className="flex items-center gap-2 text-xs uppercase tracking-[0.15em]"
          >
            <ShoppingBag size={17} />
            Bag ({cartCount})
          </Link>
        </div>
      </header>

      {/* COLLECTION INTRO */}
      <section className="mx-auto max-w-[1500px] px-5 pt-14 md:px-12 md:pt-20">
        <div className="flex items-center justify-between">
          <p className="text-[9px] uppercase tracking-[0.35em] text-black/55">
            New Collection <span className="mx-3">|</span> Premium Menswear
          </p>
          <p className="hidden text-[10px] uppercase tracking-[0.2em] text-black/45 sm:block">
            Spring / Everyday Edit
          </p>
        </div>

        <div className="mt-7 flex flex-col justify-between gap-6 border-t border-black/20 pt-7 md:flex-row md:items-end">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 text-[10px] uppercase tracking-[0.3em] text-black/45"
            >
              ATELIER. — COLLECTION 001
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="font-serif text-5xl leading-[0.95] tracking-tight md:text-8xl"
            >
              The Men&apos;s
              <br />
              <span className="italic">Collection.</span>
            </motion.h1>
          </div>

          <p className="max-w-xs text-sm leading-7 text-black/55">
            Considered essentials. Relaxed silhouettes. Everyday pieces
            designed to make a statement without saying too much.
          </p>
        </div>
      </section>

      {/* CATEGORY NAVIGATION */}
      <section
        id="collection"
        className="mx-auto mt-12 max-w-[1500px] px-5 md:mt-16 md:px-12"
      >
        <div className="flex flex-wrap items-center justify-between gap-5 border-y border-black/15 py-5">
          <div className="flex flex-wrap gap-x-7 gap-y-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`relative pb-1 text-[10px] uppercase tracking-[0.18em] transition ${
                  activeCategory === category
                    ? "text-black"
                    : "text-black/40 hover:text-black"
                }`}
              >
                {category}
                {activeCategory === category && (
                  <motion.span
                    layoutId="active-category"
                    className="absolute -bottom-[1px] left-0 h-[2px] w-full bg-black"
                  />
                )}
              </button>
            ))}
          </div>

          <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
            {filteredProducts.length} Pieces
          </p>
        </div>
      </section>

      {/* PRODUCT SHOWCASE */}
      <section className="mx-auto max-w-[1500px] px-5 pb-24 pt-8 md:px-12 md:pt-12">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.25em] text-black/40">
              Explore the edit
            </p>
            <h2 className="mt-2 font-serif text-2xl md:text-3xl">
              {activeCategory === "All"
                ? "Selected Pieces"
                : activeCategory}
            </h2>
          </div>

          <div className="hidden gap-2 sm:flex">
            <button
              aria-label="Scroll products left"
              onClick={() =>
                document
                  .getElementById("men-products")
                  ?.scrollBy({ left: -500, behavior: "smooth" })
              }
              className="rounded-full border border-black/20 p-3 transition hover:bg-black hover:text-white"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              aria-label="Scroll products right"
              onClick={() =>
                document
                  .getElementById("men-products")
                  ?.scrollBy({ left: 500, behavior: "smooth" })
              }
              className="rounded-full border border-black/20 p-3 transition hover:bg-black hover:text-white"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center">
            <p className="animate-pulse text-[10px] uppercase tracking-[0.3em] text-black/45">
              Curating your collection...
            </p>
          </div>
        ) : error ? (
          <p className="py-20 text-center text-sm text-red-600">{error}</p>
        ) : filteredProducts.length === 0 ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
            <p className="font-serif text-3xl">Nothing here just yet.</p>
            <p className="mt-3 text-sm text-black/45">
              Add products in your Admin Dashboard under the matching category.
            </p>
            <Link
              href="/admin"
              className="mt-6 rounded-full bg-black px-7 py-3 text-[10px] uppercase tracking-[0.2em] text-white"
            >
              Open Admin
            </Link>
          </div>
        ) : (
          <div
            id="men-products"
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-8"
            style={{ scrollbarWidth: "none" }}
          >
            {filteredProducts.map((product, index) => (
              <motion.button
                key={product.id}
                type="button"
                onClick={() => openProduct(product)}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.06, 0.35) }}
                className="group w-[78vw] flex-none snap-start text-left sm:w-[42vw] lg:w-[29%] xl:w-[23%]"
              >
                <div className="relative flex h-[330px] items-center justify-center overflow-hidden bg-[#efeee9] sm:h-[400px]">
                  {product.images?.[0] ? (
                    <motion.img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-[88%] w-[88%] object-contain transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <span className="font-serif text-2xl text-black/25">
                      ATELIER.
                    </span>
                  )}

                  <span className="absolute left-3 top-3 bg-white px-3 py-2 text-[9px] uppercase tracking-[0.12em] shadow-sm">
                    {product.stock > 0 ? "Available" : "Sold Out"}
                  </span>

                  <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white transition group-hover:bg-black group-hover:text-white">
                    <ArrowUpRight size={16} />
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 px-1 pt-4">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.18em] text-black/40">
                      {product.categories?.name || "Men"}
                    </p>
                    <h3 className="mt-1 text-sm">{product.name}</h3>
                  </div>
                  <p className="pt-4 text-xs">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        <p className="mt-2 text-center text-[9px] uppercase tracking-[0.25em] text-black/35">
          Scroll to discover more pieces
        </p>
      </section>

      {/* COLLECTION FOOTER */}
      <section className="border-t border-black/15 px-5 py-16 text-center md:py-20">
        <p className="text-[9px] uppercase tracking-[0.3em] text-black/40">
          ATELIER. Menswear
        </p>
        <h2 className="mt-4 font-serif text-4xl md:text-6xl">
          Less, but better.
        </h2>
        <Link
          href="/"
          className="mt-7 inline-flex items-center gap-3 rounded-full border border-black/30 px-7 py-3 text-[10px] uppercase tracking-[0.2em] transition hover:bg-black hover:text-white"
        >
          Back to Home <ArrowUpRight size={14} />
        </Link>
      </section>

      <footer
        id="footer"
        className="flex flex-col items-center justify-between gap-3 bg-[#171715] px-6 py-6 text-[9px] uppercase tracking-[0.2em] text-white/60 sm:flex-row md:px-12"
      >
        <span>© 2026 ATELIER. All rights reserved.</span>
        <span>Designed for everyday expression.</span>
      </footer>

      {/* PRODUCT DETAIL VIEW */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            className="fixed inset-0 z-50 overflow-y-auto bg-[#f8f7f4]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex min-h-screen flex-col">
              <div className="flex items-center justify-between border-b border-black/10 px-5 py-5 md:px-10">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em]"
                >
                  <ArrowLeft size={15} /> Back to collection
                </button>

                <Link href="/" className="text-lg font-semibold tracking-[0.25em]">
                  ATELIER.
                </Link>

                <button
                  aria-label="Close product"
                  onClick={() => setSelectedProduct(null)}
                  className="rounded-full border border-black/15 p-2"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="mx-auto grid w-full max-w-[1450px] flex-1 grid-cols-1 md:grid-cols-2">
                {/* LARGE PRODUCT IMAGE */}
                <div className="relative flex min-h-[430px] items-center justify-center bg-[#efeee9] p-8 md:min-h-[calc(100vh-75px)] md:p-14">
                  {productImages[imageIndex] ? (
                    <motion.img
                      key={imageIndex}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      src={productImages[imageIndex]}
                      alt={selectedProduct.name}
                      className="max-h-[70vh] w-full object-contain"
                    />
                  ) : (
                    <span className="font-serif text-4xl text-black/25">
                      ATELIER.
                    </span>
                  )}

                  {productImages.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-3">
                      {productImages.slice(0, 2).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setImageIndex(index)}
                          className={`rounded-full px-5 py-2 text-[9px] uppercase tracking-[0.15em] ${
                            imageIndex === index
                              ? "bg-black text-white"
                              : "bg-white text-black"
                          }`}
                        >
                          {index === 0 ? "Front" : "Back"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* PRODUCT DETAILS */}
                <div className="flex flex-col justify-center px-7 py-12 md:px-16 lg:px-24">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-black/40">
                    {String(
                      filteredProducts.findIndex(
                        (p) => p.id === selectedProduct.id
                      ) + 1
                    ).padStart(2, "0")}{" "}
                    / {String(filteredProducts.length).padStart(2, "0")}
                    <span className="mx-3">|</span>
                    {selectedProduct.categories?.name || "Menswear"}
                  </p>

                  <h2 className="mt-7 font-serif text-4xl leading-tight md:text-6xl">
                    {selectedProduct.name}
                  </h2>

                  <p className="mt-4 text-lg">
                    ₹{Number(selectedProduct.price).toLocaleString("en-IN")}
                  </p>

                  {selectedProduct.description && (
                    <p className="mt-6 max-w-md text-sm leading-7 text-black/55">
                      {selectedProduct.description}
                    </p>
                  )}

                  {/* SIZE OPTIONS */}
                  <div className="mt-10">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-[10px] uppercase tracking-[0.2em]">
                        Select Size
                      </p>
                      <span className="text-[9px] text-black/40">
                        Size guide
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`flex h-11 min-w-11 items-center justify-center rounded-full border px-3 text-[10px] transition ${
                            selectedSize === size
                              ? "border-black bg-black text-white"
                              : "border-black/20 hover:border-black"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* COLOUR OPTIONS */}
                  <div className="mt-8">
                    <p className="mb-4 text-[10px] uppercase tracking-[0.2em]">
                      Select Colour
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`rounded-full border px-4 py-2 text-[10px] transition ${
                            selectedColor === color
                              ? "border-black bg-black text-white"
                              : "border-black/20 hover:border-black"
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="mt-7 text-[10px] text-black/45">
                    {selectedProduct.stock > 0
                      ? `${selectedProduct.stock} available`
                      : "Currently out of stock"}
                  </p>

                  <button
                    onClick={handleAddToCart}
                    disabled={selectedProduct.stock < 1 || added}
                    className="mt-4 flex w-full items-center justify-center gap-3 rounded-full bg-black px-7 py-5 text-[10px] uppercase tracking-[0.2em] text-white transition hover:bg-black/75 disabled:cursor-not-allowed disabled:bg-black/35"
                  >
                    {added ? (
                      <>
                        <Check size={15} /> Added to Bag
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={15} /> Add to Cart
                      </>
                    )}
                  </button>

                  {added && (
                    <Link
                      href="/cart"
                      className="mt-4 text-center text-[10px] uppercase tracking-[0.2em] underline underline-offset-4"
                    >
                      View your bag
                    </Link>
                  )}

                  <p className="mt-7 text-center text-[9px] uppercase tracking-[0.15em] text-black/40">
                    Cash on Delivery Available
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
