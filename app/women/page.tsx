
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ShoppingBag,
  Heart,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";

type StoreProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[] | null;
  stock: number;
  sizes: string[] | null;
  colors: string[] | null;
  categories: { name: string; slug?: string } | null;
};

const categories = [
  "All",
  "Dresses",
  "Tops",
  "Kurtis",
  "Ethnic Wear",
];

const womenCategoryNames = [
  "women",
  "dress",
  "dresses",
  "top",
  "tops",
  "kurti",
  "kurtis",
  "ethnic wear",
];

export default function WomenPage() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] =
    useState<StoreProduct | null>(null);

  const [selectedSize, setSelectedSize] = useState("One Size");
  const [selectedColor, setSelectedColor] = useState("Default");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);

  const { cartCount, addToCart } = useCart();

  // Fetch women's products from Supabase
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, description, price, images, stock, sizes, colors, categories(name,slug)"
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        const allProducts = (data ?? []) as unknown as StoreProduct[];

        setProducts(
          allProducts.filter((product) => {
            const name =
              product.categories?.name?.trim().toLowerCase() || "";

            return womenCategoryNames.includes(name);
          })
        );
      }

      setLoading(false);
    }

    loadProducts();
  }, []);

  // Category filtering
  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter(
          (product) =>
            product.categories?.name?.toLowerCase() ===
            activeCategory.toLowerCase()
        );

  // Open product preview
  const openProduct = (product: StoreProduct) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes?.[0] || "One Size");
    setSelectedColor(product.colors?.[0] || "Default");
    setSelectedImageIndex(0);
  };

  // Close preview
  const closeProduct = () => {
    setSelectedProduct(null);
    setSelectedImageIndex(0);
  };

  // Wishlist
  const toggleFavorite = (id: string) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  // Image navigation
  const changeImage = (direction: number) => {
    if (!selectedProduct?.images?.length) return;

    const total = selectedProduct.images.length;

    setSelectedImageIndex(
      (current) => (current + direction + total) % total
    );
  };

  // Add to cart
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

    closeProduct();
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f5f0] text-[#171614]">

      {/* Announcement */}
      <div className="bg-[#171614] px-4 py-3 text-center text-[9px] tracking-[3px] text-white">
        THE WOMEN'S EDIT — DISCOVER YOUR STYLE
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f7f5f0]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between px-5 md:px-10">

          <Link
            href="/"
            className="flex items-center gap-2 text-[10px] tracking-[2px]"
          >
            <ArrowLeft size={17} />
            <span className="hidden sm:block">HOME</span>
          </Link>

          <Link
            href="/"
            className="text-[25px] font-semibold tracking-[5px]"
          >
            ATELIER<span className="text-[#a17b55]">.</span>
          </Link>

          <Link
            href="/cart"
            className="relative flex items-center gap-2"
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
      </header>

      {/* Women's Hero */}
      <section className="relative flex min-h-[620px] items-center overflow-hidden bg-[#b9a99a] md:min-h-[740px]">

        <img
          src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=2200&q=90"
          alt="Women's fashion collection"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/15 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 max-w-3xl px-7 py-24 text-white md:px-20"
        >
          <p className="mb-7 text-[10px] tracking-[5px] text-white/80">
            THE WOMEN'S COLLECTION
          </p>

          <h1 className="font-serif text-6xl leading-[1.05] md:text-8xl">
            Elegance in
            <br />
            <span className="italic">every detail.</span>
          </h1>

          <p className="mt-8 max-w-md text-sm leading-7 text-white/80">
            Discover thoughtfully selected styles that celebrate
            individuality, confidence and effortless everyday fashion.
          </p>

          <a
            href="#women-shop"
            className="group mt-10 inline-flex items-center gap-6 rounded-full border border-white/60 bg-white/10 py-2 pl-7 pr-2 backdrop-blur-md transition hover:bg-white/20"
          >
            <span className="text-[10px] tracking-[3px]">
              EXPLORE THE EDIT
            </span>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black transition group-hover:bg-[#a17b55] group-hover:text-white">
              <ArrowRight size={18} />
            </span>
          </a>
        </motion.div>

        <div className="absolute bottom-8 right-10 hidden text-[9px] tracking-[4px] text-white md:block">
          ATELIER WOMEN — 2026
        </div>
      </section>

      {/* Intro */}
      <section className="px-6 py-24 text-center md:py-32">
        <p className="mb-5 text-[10px] tracking-[4px] text-[#a17b55]">
          MADE TO FEEL DIFFERENT
        </p>

        <h2 className="mx-auto max-w-3xl font-serif text-4xl leading-tight md:text-6xl">
          Your style.
          <br />
          <span className="italic text-[#a17b55]">
            Your expression.
          </span>
        </h2>

        <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-black/55">
          From everyday essentials to special occasion pieces,
          find styles that make every moment your own.
        </p>
      </section>

      {/* Category showcase */}
      <section className="px-5 pb-20 md:px-10">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-10">
            <p className="mb-3 text-[10px] tracking-[3px] text-[#a17b55]">
              THE COLLECTION
            </p>
            <h2 className="font-serif text-4xl md:text-5xl">
              Explore your edit.
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

            {[
              {
                name: "Dresses",
                image:
                  "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85",
              },
              {
                name: "Tops",
                image:
                  "https://springandsummer.lk/cdn/shop/files/WomenEmbroideredFrillNeckTopwithPintuck_2_1200x1200.jpg?v=1726714961",
              },
              {
                name: "Kurtis",
                image:
                  "https://laxmipati.com/cdn/shop/products/K21-1-A.jpg?v=1664269342&width=2048",
              },
              {
                name: "Ethnic Wear",
                image:
                  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85",
              },
            ].map((item, index) => (
              <button
                key={item.name}
                onClick={() => {
                  setActiveCategory(item.name);
                  document
                    .getElementById("women-shop")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group text-left"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-[#e8e3dc]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                  <div className="absolute bottom-5 left-5 right-3 text-white">
                    <p className="text-[9px] tracking-[2px]">
                      0{index + 1}
                    </p>
                    <h3 className="mt-2 font-serif text-2xl md:text-3xl">
                      {item.name}
                    </h3>
                  </div>
                </div>
              </button>
            ))}

          </div>
        </div>
      </section>

      {/* Interactive Product Collection */}
      <section
        id="women-shop"
        className="overflow-hidden bg-[#eeece6] px-5 py-24 md:px-10 md:py-32"
      >
        <div className="mx-auto max-w-[1500px]">

          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-[10px] tracking-[4px] text-[#a17b55]">
                CURATED FOR YOU
              </p>

              <h2 className="font-serif text-5xl tracking-tight md:text-7xl">
                The women's edit.
              </h2>

              <p className="mt-4 text-[10px] tracking-[2px] text-black/45">
                CONSIDERED PIECES. TIMELESS STYLE.
              </p>
            </div>

            <div className="flex flex-wrap gap-6">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`border-b pb-2 text-[10px] tracking-[2px] transition ${
                    activeCategory === category
                      ? "border-[#a17b55] text-[#a17b55]"
                      : "border-transparent text-black/45 hover:text-black"
                  }`}
                >
                  {category.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <p className="py-24 text-center text-sm text-black/50">
              Discovering the women's collection...
            </p>
          )}

          {error && (
            <p className="py-24 text-center text-sm text-red-600">
              Unable to load products: {error}
            </p>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <div className="py-24 text-center">
              <p className="font-serif text-3xl">
                Nothing here just yet.
              </p>
              <p className="mt-4 text-sm text-black/50">
                Add women's products in your Admin Dashboard under
                Dresses, Tops, Kurtis or Ethnic Wear.
              </p>
            </div>
          )}

          {!loading && !error && filteredProducts.length > 0 && (
            <>
              <div className="mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-8">

                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product, index) => (
                    <motion.article
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        duration: 0.5,
                        delay: Math.min(index * 0.04, 0.2),
                      }}
                      className="group w-[78vw] max-w-[390px] flex-shrink-0 snap-start sm:w-[340px] md:w-[360px]"
                    >
                      <div className="relative overflow-hidden bg-[#e5e2dc]">

                        <button
                          type="button"
                          onClick={() => openProduct(product)}
                          className="block w-full text-left"
                        >
                          <div className="relative aspect-[4/5] overflow-hidden">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="h-full w-full object-contain p-3 mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-[10px] tracking-[3px] text-black/40">
                                IMAGE COMING SOON
                              </div>
                            )}

                            <span className="absolute left-5 top-5 text-[9px] tracking-[2px] text-black/50">
                              {String(index + 1).padStart(2, "0")} /{" "}
                              {String(filteredProducts.length).padStart(2, "0")}
                            </span>

                            <span className="absolute bottom-5 left-5 text-[9px] tracking-[2px] text-black/50">
                              {product.categories?.name || "ATELIER"}
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleFavorite(product.id)}
                          aria-label="Toggle wishlist"
                          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f5f0]/90"
                        >
                          <Heart
                            size={17}
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
                          type="button"
                          disabled={product.stock <= 0}
                          onClick={() => openProduct(product)}
                          className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-[#171614] px-6 py-5 text-white transition-colors hover:bg-[#a17b55] disabled:cursor-not-allowed disabled:bg-black/50"
                        >
                          <span className="text-[9px] tracking-[3px]">
                            {product.stock > 0
                              ? "DISCOVER PRODUCT"
                              : "OUT OF STOCK"}
                          </span>
                          <ArrowUpRight size={17} />
                        </button>
                      </div>

                      <div className="flex items-start justify-between gap-3 pt-5">
                        <div>
                          <h3 className="text-sm tracking-[0.5px]">
                            {product.name}
                          </h3>
                          <p className="mt-2 text-[9px] tracking-[2px] text-black/45">
                            {product.categories?.name || "ATELIER COLLECTION"}
                          </p>
                        </div>

                        <p className="whitespace-nowrap text-sm">
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-5">
                <p className="text-[9px] tracking-[2px] text-black/45">
                  SCROLL TO EXPLORE THE COLLECTION
                </p>
                <p className="text-[9px] tracking-[2px] text-black/45">
                  {filteredProducts.length} PIECES
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Brand message */}
      <section className="grid md:grid-cols-2">
        <div className="relative min-h-[450px] md:min-h-[600px]">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=85"
            alt="Women's fashion"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-center bg-[#24211d] px-8 py-20 text-white md:px-16 lg:px-24">
          <p className="mb-7 text-[10px] tracking-[4px] text-[#c5a17d]">
            THE ATELIER WOMAN
          </p>

          <h2 className="font-serif text-5xl leading-tight md:text-6xl">
            Be your
            <br />
            <span className="italic text-[#c5a17d]">
              own kind of beautiful.
            </span>
          </h2>

          <p className="mt-8 max-w-md text-sm leading-8 text-white/60">
            Fashion is personal. Discover pieces that complement
            your individuality and make your everyday moments feel special.
          </p>

          <a
            href="#women-shop"
            className="mt-10 inline-flex w-fit items-center gap-4 border-b border-white/40 pb-3 text-[10px] tracking-[3px] transition hover:text-[#c5a17d]"
          >
            EXPLORE THE COLLECTION
            <ArrowUpRight size={16} />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#171614] px-6 py-14 text-white md:px-10">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-10 md:flex-row">
          <div>
            <Link
              href="/"
              className="text-3xl font-semibold tracking-[5px]"
            >
              ATELIER<span className="text-[#a17b55]">.</span>
            </Link>

            <p className="mt-4 max-w-xs text-xs leading-6 text-white/45">
              A considered collection for every day, every occasion,
              and every individual.
            </p>
          </div>

          <div className="flex flex-wrap gap-12">
            <div>
              <h4 className="mb-5 text-[10px] tracking-[2px] text-[#c5a17d]">
                EXPLORE
              </h4>
              <div className="flex flex-col gap-3 text-xs text-white/60">
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
                <Link href="/men" className="hover:text-white">
                  Men
                </Link>
                <Link href="/women" className="hover:text-white">
                  Women
                </Link>
              </div>
            </div>

            <div>
              <h4 className="mb-5 text-[10px] tracking-[2px] text-[#c5a17d]">
                HELP
              </h4>
              <div className="flex flex-col gap-3 text-xs text-white/60">
                <Link href="/cart" className="hover:text-white">
                  Shopping bag
                </Link>
                <a href="#women-shop" className="hover:text-white">
                  Collections
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 flex max-w-[1500px] flex-col justify-between gap-3 border-t border-white/15 pt-6 text-[9px] tracking-[2px] text-white/40 sm:flex-row">
          <span>© 2026 ATELIER. ALL RIGHTS RESERVED.</span>
          <span>MADE FOR YOUR EVERYDAY.</span>
        </div>
      </footer>

      {/* Full-screen product preview */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] overflow-y-auto bg-[#f7f5f0]"
          >
            <div className="flex min-h-screen flex-col">

              {/* Preview header */}
              <div className="sticky top-0 z-20 flex items-center justify-between border-b border-black/10 bg-[#f7f5f0]/95 px-6 py-5 backdrop-blur-md md:px-12">
                <Link
                  href="/"
                  className="text-xl font-semibold tracking-[5px]"
                  onClick={closeProduct}
                >
                  ATELIER<span className="text-[#a17b55]">.</span>
                </Link>

                <button
                  onClick={closeProduct}
                  className="flex items-center gap-3 text-[10px] tracking-[2px]"
                >
                  CLOSE <X size={20} />
                </button>
              </div>

              <div className="mx-auto grid w-full max-w-[1450px] flex-1 items-center gap-10 px-5 py-10 md:grid-cols-2 md:gap-20 md:px-12 md:py-16">

                {/* Images */}
                <div>
                  <div className="group relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-[#e9e6df]">

                    {selectedProduct.images?.length ? (
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={selectedImageIndex}
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.97 }}
                          transition={{ duration: 0.3 }}
                          src={
                            selectedProduct.images[selectedImageIndex] ||
                            selectedProduct.images[0]
                          }
                          alt={selectedProduct.name}
                          className="h-full w-full object-contain p-5 mix-blend-multiply"
                        />
                      </AnimatePresence>
                    ) : (
                      <span className="text-xs tracking-[3px] text-black/40">
                        IMAGE COMING SOON
                      </span>
                    )}

                    {selectedProduct.images &&
                      selectedProduct.images.length > 1 && (
                        <>
                          <button
                            onClick={() => changeImage(-1)}
                            aria-label="Previous image"
                            className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#f7f5f0]/90 transition hover:bg-white"
                          >
                            <ChevronLeft size={20} />
                          </button>

                          <button
                            onClick={() => changeImage(1)}
                            aria-label="Next image"
                            className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#f7f5f0]/90 transition hover:bg-white"
                          >
                            <ChevronRight size={20} />
                          </button>
                        </>
                      )}

                    <span className="absolute bottom-5 left-5 text-[9px] tracking-[2px] text-black/50">
                      {selectedProduct.images?.length
                        ? `VIEW ${selectedImageIndex + 1} / ${selectedProduct.images.length}`
                        : "PRODUCT VIEW"}
                    </span>
                  </div>

                  {/* Image thumbnails */}
                  {selectedProduct.images &&
                    selectedProduct.images.length > 1 && (
                      <div className="mt-4 flex gap-3">
                        {selectedProduct.images.map((image, index) => (
                          <button
                            key={`${image}-${index}`}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`h-20 w-16 overflow-hidden border bg-[#e9e6df] ${
                              selectedImageIndex === index
                                ? "border-black"
                                : "border-black/15"
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${selectedProduct.name} view ${index + 1}`}
                              className="h-full w-full object-contain mix-blend-multiply"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                </div>

                {/* Details */}
                <div className="flex flex-col justify-center py-5">
                  <p className="text-[10px] tracking-[4px] text-[#a17b55]">
                    {selectedProduct.categories?.name ||
                      "WOMEN'S COLLECTION"}
                  </p>

                  <h2 className="mt-5 font-serif text-4xl leading-tight md:text-6xl">
                    {selectedProduct.name}
                  </h2>

                  <p className="mt-5 text-xl">
                    ₹
                    {Number(selectedProduct.price).toLocaleString("en-IN")}
                  </p>

                  <p className="mt-5 max-w-md text-sm leading-7 text-black/55">
                    {selectedProduct.description ||
                      "A considered piece designed to bring effortless style to your everyday wardrobe."}
                  </p>

                  <p className="mt-5 text-[10px] tracking-[2px] text-black/50">
                    {selectedProduct.stock > 0
                      ? `${selectedProduct.stock} PIECES AVAILABLE`
                      : "CURRENTLY OUT OF STOCK"}
                  </p>

                  {/* Sizes */}
                  <div className="mt-10">
                    <p className="mb-4 text-[10px] tracking-[2px]">
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
                          className={`flex h-11 min-w-11 items-center justify-center border px-4 text-xs transition ${
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

                  {/* Colours */}
                  <div className="mt-8">
                    <p className="mb-4 text-[10px] tracking-[2px]">
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
                          className={`border px-5 py-3 text-xs transition ${
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

                  {/* Add to bag */}
                  <button
                    onClick={handleAddToCart}
                    disabled={selectedProduct.stock <= 0}
                    className="mt-10 w-full bg-[#171614] py-5 text-[10px] tracking-[3px] text-white transition hover:bg-[#a17b55] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {selectedProduct.stock > 0
                      ? "ADD TO BAG"
                      : "OUT OF STOCK"}
                  </button>

                  <p className="mt-5 text-center text-[9px] tracking-[2px] text-black/40">
                    CASH ON DELIVERY AVAILABLE
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
