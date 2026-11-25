
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  Check,
  Heart,
  Menu,
  Plus,
  ShoppingBag,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";

const collections = [
  {
    name: "FOR HIM",
    href: "/men",
    subtitle: "Everyday essentials, elevated.",
    image:
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1000&q=85",
    number: "01",
  },
  {
    name: "FOR HER",
    href: "/women",
    subtitle: "Designed to make a statement.",
    image:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85",
    number: "02",
  },
  {
    name: "LITTLE ONES",
    href: "/kids",
    subtitle: "Little looks, big personality.",
    image:
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1000&q=85",
    number: "03",
  },
];

const filters = ["All", "Men", "Women", "Kids"];

type StoreProduct = {
  id: string;
  name: string;
  price: number;
  images: string[] | null;
  stock: number;
  sizes: string[] | null;
  colors: string[] | null;
  categories: { name: string } | null;
};

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [subscribed, setSubscribed] = useState(false);

  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  const [selectedProduct, setSelectedProduct] =
    useState<StoreProduct | null>(null);

  const [selectedSize, setSelectedSize] = useState("One Size");
  const [selectedColor, setSelectedColor] = useState("Default");

  const { cartCount, addToCart } = useCart();

  // Load products from Supabase
  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, price, images, stock, sizes, colors, categories(name)"
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        setProductsError(error.message);
      } else {
        setProducts((data ?? []) as unknown as StoreProduct[]);
      }

      setProductsLoading(false);
    }

    loadProducts();
  }, []);

  // Filter products by the collection they belong to.
  // Product categories such as Shirts, Dresses, Boys and Girls are grouped
  // under the corresponding main collection on the homepage.
  const collectionCategoryNames: Record<string, string[]> = {
    Men: ["men", "shirt", "shirts", "t-shirt", "t-shirts", "pants", "trousers", "jeans", "hoodie", "hoodies"],
    Women: ["women", "dress", "dresses", "top", "tops", "kurti", "kurtis", "ethnic wear", "ethnic-wear"],
    Kids: ["kids", "kid", "boy", "boys", "girl", "girls", "baby & toddlers", "baby-toddlers", "baby", "toddler", "toddlers"],
  };

  const filteredProducts =
    activeFilter === "All"
      ? products
      : products.filter((product) => {
          const categoryName = product.categories?.name?.trim().toLowerCase() || "";
          const acceptedNames = collectionCategoryNames[activeFilter] || [activeFilter.toLowerCase()];
          return acceptedNames.includes(categoryName);
        });

  // Wishlist
  const toggleFavorite = (id: string) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  // Open product options
  const openProductOptions = (product: StoreProduct) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes?.[0] || "One Size");
    setSelectedColor(product.colors?.[0] || "Default");
  };

  // Add selected product to cart
  const handleAddToCart = () => {
    if (!selectedProduct || selectedProduct.stock <= 0) return;

    addToCart({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: Number(selectedProduct.price),
      image: selectedProduct.images?.[0] || "",
      size: selectedSize,
      color: selectedColor,
      stock: selectedProduct.stock,
    });

    setSelectedProduct(null);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f5f0] text-[#171614]">
      {/* Announcement bar */}
      <div className="bg-[#171614] px-4 py-2.5 text-center text-[9px] tracking-[2.5px] text-white sm:text-[10px]">
        A NEW SEASON. A NEW PERSPECTIVE. &nbsp; — &nbsp; DISCOVER THE COLLECTION
      </div>

      {/* Navigation */}
      <header className="relative z-50 border-b border-black/10 bg-[#f7f5f0]">
        <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between px-5 md:px-10">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center gap-2 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#shop" className="nav-link">
              SHOP
            </a>
            <a href="#collections" className="nav-link">
              COLLECTIONS
            </a>
            <a href="#story" className="nav-link">
              OUR STORY
            </a>
          </nav>

          <a
            href="#home"
            className="absolute left-1/2 -translate-x-1/2 text-[25px] font-semibold tracking-[5px] sm:text-[29px]"
          >
            ATELIER<span className="text-[#a17b55]">.</span>
          </a>

          <div className="ml-auto flex items-center gap-5">
            <a
              href="#shop"
              className="hidden text-[10px] tracking-[2px] sm:block"
            >
              SEARCH
            </a>

            <Link
              href="/cart"
              className="relative flex items-center gap-2"
              aria-label="Shopping bag"
            >
              <ShoppingBag size={19} strokeWidth={1.5} />
              <span className="hidden text-[10px] tracking-[2px] sm:block">
                BAG
              </span>
              <span className="absolute -right-3 -top-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#a17b55] px-1 text-[9px] text-white">
                {cartCount}
              </span>
            </Link>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-black/10 bg-[#f7f5f0] md:hidden"
            >
              <nav className="flex flex-col gap-6 px-7 py-8 text-[12px] tracking-[3px]">
                {[
                  ["SHOP", "#shop"],
                  ["COLLECTIONS", "#collections"],
                  ["OUR STORY", "#story"],
                  ["CONTACT", "#contact"],
                ].map(([label, href]) => (
                  <a
                    key={label}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero */}
      <section
        id="home"
        className="relative flex min-h-[690px] items-center overflow-hidden bg-[#28231e] md:min-h-[790px]"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2200&q=90')",
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/20 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 max-w-3xl px-7 py-24 text-white md:px-20"
        >
          <p className="mb-7 text-[10px] tracking-[5px] text-white/80 md:text-xs">
            THE NEW SEASON COLLECTION — 2026
          </p>

          <h1 className="font-serif text-[58px] leading-[1.04] tracking-[-2px] sm:text-[78px] md:text-[105px]">
            Wear your
            <br />
            <span className="font-light italic">own story.</span>
          </h1>

          <p className="mt-8 max-w-md text-sm leading-7 text-white/80 md:text-base">
            Thoughtfully selected styles. Timeless details. Discover clothing
            that feels as individual as you are.
          </p>

          <motion.a
            href="#collections"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="group relative mt-10 inline-flex items-center gap-7 overflow-hidden rounded-full border border-white/60 bg-white/10 py-2 pl-7 pr-2 text-white backdrop-blur-md transition-colors duration-500 hover:bg-white/20"
          >
            <span className="relative z-10 text-[10px] tracking-[3px]">
              EXPLORE COLLECTION
            </span>
            <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white text-black transition-all duration-500 group-hover:bg-[#a17b55] group-hover:text-white">
              <motion.span
                className="flex"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight size={18} />
              </motion.span>
            </span>
            <span className="absolute inset-0 -translate-x-full rounded-full bg-white/10 transition-transform duration-500 group-hover:translate-x-0" />
          </motion.a>
        </motion.div>

        <div className="absolute bottom-8 right-10 hidden text-[10px] tracking-[4px] text-white md:block">
          STYLE · QUALITY · IDENTITY
        </div>

        <div className="absolute bottom-8 left-7 flex items-center gap-3 text-[9px] tracking-[3px] text-white/70 md:left-10">
          <span className="h-px w-10 bg-white/70" />
          SCROLL TO DISCOVER
        </div>
      </section>

      {/* Intro */}
      <section className="px-6 py-24 text-center md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="mb-6 text-[10px] tracking-[4px] text-[#a17b55]">
            A DIFFERENT KIND OF EVERYDAY
          </p>
          <h2 className="mx-auto max-w-3xl font-serif text-4xl leading-tight md:text-6xl">
            Style is not about fitting in.
            <br />
            <span className="italic text-[#a17b55]">
              It is about feeling you.
            </span>
          </h2>
          <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-black/55">
            Discover thoughtfully chosen pieces for every mood, every moment,
            and every version of yourself.
          </p>
        </motion.div>
      </section>

      {/* Collections */}
      <section id="collections" className="px-5 pb-24 md:px-10 md:pb-32">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-3 text-[10px] tracking-[3px] text-[#a17b55]">
                FIND YOUR LOOK
              </p>
              <h2 className="font-serif text-4xl md:text-5xl">
                Explore collections
              </h2>
            </div>
            <span className="hidden text-[10px] tracking-[2px] text-black/50 sm:block">
              01 — 03
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {collections.map((item, index) => (
              <motion.a
                href={item.href}
                key={item.name}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.12 }}
                className="group relative block h-[430px] overflow-hidden bg-[#ded9d0] md:h-[570px]"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/5" />
                <div className="absolute bottom-8 left-8 text-white">
                  <p className="mb-3 text-[10px] tracking-[3px] text-white/70">
                    COLLECTION {item.number}
                  </p>
                  <h3 className="font-serif text-4xl">{item.name}</h3>
                  <p className="mt-2 text-xs text-white/75">
                    {item.subtitle}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-3 text-[10px] tracking-[2px]">
                    DISCOVER <ArrowUpRight size={15} />
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Products from Supabase */}
      <section
        id="shop"
        className="bg-[#eeece6] px-5 py-24 md:px-10 md:py-32"
      >
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-[10px] tracking-[3px] text-[#a17b55]">
                CURATED FOR YOU
              </p>
              <h2 className="font-serif text-4xl md:text-6xl">
                The latest edit.
              </h2>
            </div>

            <div className="flex flex-wrap gap-5">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`border-b pb-2 text-[10px] tracking-[2px] transition-colors ${
                    activeFilter === filter
                      ? "border-[#a17b55] text-[#a17b55]"
                      : "border-transparent text-black/50 hover:text-black"
                  }`}
                >
                  {filter.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {productsLoading && (
            <p className="py-16 text-center text-sm text-black/50">
              Discovering the latest collection...
            </p>
          )}

          {productsError && (
            <p className="py-16 text-center text-sm text-red-600">
              Unable to load products: {productsError}
            </p>
          )}

          {!productsLoading &&
            !productsError &&
            filteredProducts.length === 0 && (
              <p className="py-16 text-center text-sm text-black/50">
                No products available in this collection yet.
              </p>
            )}

          {!productsLoading &&
            !productsError &&
            filteredProducts.length > 0 && (
              <motion.div
                layout
                className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => (
                    <motion.article
                      layout
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.35 }}
                      className="group"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden bg-[#dedbd4]">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs tracking-widest text-black/40">
                            IMAGE COMING SOON
                          </div>
                        )}

                        <button
                          onClick={() => toggleFavorite(product.id)}
                          aria-label="Toggle wishlist"
                          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#f7f5f0]/90 transition-colors hover:bg-white"
                        >
                          <Heart
                            size={16}
                            strokeWidth={1.5}
                            fill={
                              favorites.includes(product.id)
                                ? "#a17b55"
                                : "transparent"
                            }
                            color={
                              favorites.includes(product.id)
                                ? "#a17b55"
                                : "#171614"
                            }
                          />
                        </button>

                        <button
                          disabled={product.stock <= 0}
                          onClick={() => openProductOptions(product)}
                          className="absolute bottom-0 left-0 right-0 flex translate-y-0 items-center justify-center gap-2 bg-[#171614] py-4 text-[9px] tracking-[2px] text-white transition-transform duration-300 disabled:bg-black/50 md:translate-y-full md:group-hover:translate-y-0"
                        >
                          <Plus size={14} />
                          {product.stock > 0
                            ? "CHOOSE OPTIONS"
                            : "OUT OF STOCK"}
                        </button>
                      </div>

                      <div className="flex items-start justify-between gap-2 pt-4">
                        <div>
                          <h3 className="text-xs md:text-sm">
                            {product.name}
                          </h3>
                          <p className="mt-1 text-[10px] text-black/45">
                            {product.categories?.name || "Fashion"}
                          </p>
                        </div>
                        <p className="whitespace-nowrap text-xs">
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

          <div className="mt-16 text-center">
            <a
              href="#contact"
              className="group inline-flex items-center gap-5 border-b border-black/40 pb-3 text-[10px] tracking-[3px] transition-colors hover:border-[#a17b55] hover:text-[#a17b55]"
            >
              VIEW THE FULL COLLECTION
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </a>
          </div>
        </div>
      </section>

      {/* Brand story */}
      <section id="story" className="grid md:grid-cols-2">
        <div className="relative min-h-[450px] overflow-hidden md:min-h-[700px]">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85"
            alt="Fashion store interior"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-center bg-[#24211d] px-8 py-20 text-white md:px-16 lg:px-24">
          <p className="mb-7 text-[10px] tracking-[4px] text-[#c5a17d]">
            THE ATELIER APPROACH
          </p>
          <h2 className="font-serif text-5xl leading-tight md:text-6xl">
            Less, but
            <br />
            <span className="italic text-[#c5a17d]">better.</span>
          </h2>
          <p className="mt-8 max-w-md text-sm leading-8 text-white/60">
            We believe getting dressed should feel effortless. Our collection
            brings together considered designs, versatile pieces, and details
            that make everyday style feel special.
          </p>
          <a
            href="#contact"
            className="group mt-10 inline-flex w-fit items-center gap-4 border-b border-white/40 pb-3 text-[10px] tracking-[3px] transition-colors hover:text-[#c5a17d]"
          >
            GET TO KNOW US
            <ArrowUpRight
              size={16}
              className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </a>
        </div>
      </section>

      {/* Newsletter */}
      <section id="contact" className="px-6 py-24 text-center md:py-32">
        <p className="mb-5 text-[10px] tracking-[4px] text-[#a17b55]">
          STAY IN THE LOOP
        </p>
        <h2 className="font-serif text-4xl md:text-6xl">
          A little note from us.
        </h2>
        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-black/50">
          Be the first to discover new arrivals, fresh edits, and stories from
          the world of Atelier.
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSubscribed(true);
          }}
          className="mx-auto mt-10 flex max-w-lg border-b border-black/40"
        >
          <input
            type="email"
            required
            placeholder="YOUR EMAIL ADDRESS"
            className="min-w-0 flex-1 bg-transparent px-2 py-4 text-[10px] tracking-[2px] outline-none placeholder:text-black/40"
          />
          <button
            type="submit"
            className="flex items-center gap-3 px-3 text-[10px] tracking-[2px] transition-colors hover:text-[#a17b55]"
          >
            {subscribed ? (
              <>
                SUBSCRIBED <Check size={16} />
              </>
            ) : (
              <>
                SIGN UP <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="bg-[#171614] px-6 py-14 text-white md:px-10">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-12 md:flex-row">
          <div>
            <a href="#home" className="text-3xl font-semibold tracking-[5px]">
              ATELIER<span className="text-[#a17b55]">.</span>
            </a>
            <p className="mt-4 max-w-xs text-xs leading-6 text-white/45">
              A considered collection for every day, every occasion, and every
              individual.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 sm:grid-cols-3">
            <div>
              <h4 className="mb-5 text-[10px] tracking-[2px] text-[#c5a17d]">
                EXPLORE
              </h4>
              <div className="flex flex-col gap-3 text-xs text-white/60">
                <a href="#shop" className="hover:text-white">
                  Shop
                </a>
                <a href="#collections" className="hover:text-white">
                  Collections
                </a>
                <a href="#story" className="hover:text-white">
                  Our story
                </a>
              </div>
            </div>

            <div>
              <h4 className="mb-5 text-[10px] tracking-[2px] text-[#c5a17d]">
                HELP
              </h4>
              <div className="flex flex-col gap-3 text-xs text-white/60">
                <a href="#contact" className="hover:text-white">
                  Contact us
                </a>
                <a href="#contact" className="hover:text-white">
                  Shipping
                </a>
                <a href="#contact" className="hover:text-white">
                  Returns
                </a>
              </div>
            </div>

            <div>
              <h4 className="mb-5 text-[10px] tracking-[2px] text-[#c5a17d]">
                FOLLOW
              </h4>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-white"
              >
                <Camera size={15} /> Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 flex max-w-[1500px] flex-col justify-between gap-3 border-t border-white/15 pt-6 text-[9px] tracking-[2px] text-white/40 sm:flex-row">
          <span>© 2026 ATELIER. ALL RIGHTS RESERVED.</span>
          <span>MADE FOR YOUR EVERYDAY.</span>
        </div>
      </footer>

      {/* Product options popup */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 25 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-md bg-[#f7f5f0] p-7"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] tracking-[3px] text-[#a17b55]">
                    YOUR SELECTION
                  </p>
                  <h2 className="mt-2 font-serif text-3xl">
                    {selectedProduct.name}
                  </h2>
                  <p className="mt-2 text-sm">
                    ₹
                    {Number(selectedProduct.price).toLocaleString("en-IN")}
                  </p>
                  <p className="mt-1 text-xs text-black/50">
                    {selectedProduct.stock} available
                  </p>
                </div>

                <button
                  onClick={() => setSelectedProduct(null)}
                  aria-label="Close options"
                >
                  <X size={21} />
                </button>
              </div>

              <div className="mt-8">
                <p className="mb-3 text-[10px] tracking-[2px]">
                  SELECT SIZE
                </p>
                <div className="flex flex-wrap gap-2">
                  {(selectedProduct.sizes?.length
                    ? selectedProduct.sizes
                    : ["One Size"]
                  ).map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-12 border px-4 py-3 text-xs ${
                        selectedSize === size
                          ? "border-black bg-black text-white"
                          : "border-black/20"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-7">
                <p className="mb-3 text-[10px] tracking-[2px]">
                  SELECT COLOUR
                </p>
                <div className="flex flex-wrap gap-2">
                  {(selectedProduct.colors?.length
                    ? selectedProduct.colors
                    : ["Default"]
                  ).map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`border px-4 py-3 text-xs ${
                        selectedColor === color
                          ? "border-black bg-black text-white"
                          : "border-black/20"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={selectedProduct.stock <= 0}
                className="mt-9 w-full rounded-full bg-[#171614] py-4 text-[10px] tracking-[2px] text-white transition hover:bg-[#a17b55] disabled:cursor-not-allowed disabled:opacity-50"
              >
                ADD TO BAG
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
