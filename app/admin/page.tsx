
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import {
  Plus,
  Package,
  Trash2,
  Edit,
  LogOut,
  Upload,
  X,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";

type Category = {
  id: number;
  name: string;
};

type Product = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  price: number;
  category_id: number | null;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  is_active: boolean;
};


type OrderItem = {
  id: string;
  product_name: string;
  quantity: number;
  selected_size: string | null;
  selected_color: string | null;
  unit_price: number;
};

type Order = {
  id: string;
  order_number: number;
  customer_id: string;
  total_amount: number;
  payment_method: string;
  order_status: string;
  shipping_address: Record<string, unknown> | null;
  created_at: string;
  customers:
    | { full_name: string; phone: string; email: string | null }
    | { full_name: string; phone: string; email: string | null }[]
    | null;
  order_items: OrderItem[] | null;
};

const ORDER_STATUSES = [
  "New Order",
  "Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
] as const;

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category_id: "",
  sizes: "",
  colors: "",
  stock: "0",
  is_active: true,
};

export default function AdminDashboard() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setProducts((data || []) as Product[]);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        customer_id,
        total_amount,
        payment_method,
        order_status,
        shipping_address,
        created_at,
        customers ( full_name, phone, email ),
        order_items (
          id,
          product_name,
          quantity,
          selected_size,
          selected_color,
          unit_price
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(`Unable to load orders: ${error.message}`);
      setOrders([]);
    } else {
      setOrders((data || []) as unknown as Order[]);
    }

    setOrdersLoading(false);
  }, []);

  async function updateOrderStatus(orderId: string, status: string) {
    setUpdatingOrderId(orderId);
    setMessage("");

    const { error } = await supabase
      .from("orders")
      .update({ order_status: status })
      .eq("id", orderId);

    if (error) {
      setMessage(`Unable to update order status: ${error.message}`);
    } else {
      setOrders((current) =>
        current.map((order) =>
          order.id === orderId ? { ...order, order_status: status } : order
        )
      );
      setMessage("Order status updated.");
    }

    setUpdatingOrderId(null);
  }

  const checkAdmin = useCallback(async () => {
    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      router.replace("/admin/login");
      return;
    }

    const { data: admin, error } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (error || !admin) {
      await supabase.auth.signOut();
      router.replace("/admin/login");
      return;
    }

    setAuthorized(true);

    const { data: categoryData, error: categoryError } =
      await supabase.from("categories").select("*").order("name");

    if (categoryError) {
      setMessage(categoryError.message);
    } else {
      setCategories(categoryData || []);
    }

    await Promise.all([loadProducts(), loadOrders()]);
    setLoading(false);
  }, [loadProducts, loadOrders, router]);

  useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

  function resetForm() {
    setForm(emptyForm);
    setImageFile(null);
    setEditingId(null);
    setExistingImage("");
    const input = document.getElementById(
      "product-image"
    ) as HTMLInputElement | null;

    if (input) input.value = "";
  }

  function editProduct(product: Product) {
    setEditingId(product.id);
    setExistingImage(product.images?.[0] || "");
    setImageFile(null);

    setForm({
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      category_id: String(product.category_id || ""),
      sizes: (product.sizes || []).join(", "),
      colors: (product.colors || []).join(", "),
      stock: String(product.stock),
      is_active: product.is_active,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadImage(userId: string) {
    if (!imageFile) return existingImage;

    if (!imageFile.type.startsWith("image/")) {
      throw new Error("Please select a valid image.");
    }

    if (imageFile.size > 5 * 1024 * 1024) {
      throw new Error("Image must be smaller than 5 MB.");
    }

    const extension = imageFile.name.split(".").pop() || "jpg";
    const filePath = `${userId}/${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(filePath, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function saveProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        throw new Error("Please log in again.");
      }

      const price = Number(form.price);
      const stock = Number(form.stock);

      if (!Number.isFinite(price) || price <= 0) {
        throw new Error("Enter a valid product price.");
      }

      if (!Number.isInteger(stock) || stock < 0) {
        throw new Error("Enter a valid stock quantity.");
      }

      if (!form.category_id) {
        throw new Error("Please select a category.");
      }

      const imageUrl = await uploadImage(authData.user.id);

      const slug =
        form.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") +
        "-" +
        (editingId ? editingId.slice(0, 8) : crypto.randomUUID().slice(0, 8));

      const productData = {
        name: form.name.trim(),
        slug,
        description: form.description.trim(),
        price,
        category_id: Number(form.category_id),
        images: imageUrl ? [imageUrl] : [],
        sizes: form.sizes
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        colors: form.colors
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        stock,
        is_active: form.is_active,
      };

      if (editingId) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingId);

        if (error) throw error;
        setMessage("Product updated successfully!");
      } else {
        const { error } = await supabase
          .from("products")
          .insert(productData);

        if (error) throw error;
        setMessage("Product added successfully!");
      }

      resetForm();
      await loadProducts();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Product deleted successfully.");
      await loadProducts();
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  if (loading || !authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f5f0]">
        <p className="text-sm tracking-widest">LOADING ADMIN DASHBOARD...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#171614]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <div>
            <h1 className="text-xl font-semibold tracking-[4px]">
              ATELIER<span className="text-[#a17b55]">.</span>
            </h1>
            <p className="mt-1 text-[9px] tracking-[3px] text-black/50">
              ADMIN DASHBOARD
            </p>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/"
              className="hidden text-xs text-black/60 hover:text-black sm:block"
            >
              View Store
            </a>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-xs"
            >
              <LogOut size={17} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] tracking-[3px] text-[#a17b55]">
              STORE MANAGEMENT
            </p>
            <h2 className="mt-3 font-serif text-4xl">Products</h2>
            <p className="mt-2 text-sm text-black/50">
              Manage your clothing catalogue and inventory.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border border-black/10 bg-white px-5 py-4">
              <Package size={19} />
              <span className="text-sm">{products.length} products</span>
            </div>

            <button
              onClick={loadProducts}
              className="flex h-[54px] w-[54px] items-center justify-center border border-black/10 bg-white hover:bg-[#eee]"
              aria-label="Refresh products"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {message && (
          <div className="mb-6 flex items-start justify-between gap-4 border border-black/10 bg-white p-4 text-sm">
            <p>{message}</p>
            <button onClick={() => setMessage("")} aria-label="Dismiss">
              <X size={17} />
            </button>
          </div>
        )}

        {/* Orders management */}
        <section className="mb-12">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] tracking-[3px] text-[#a17b55]">
                STORE MANAGEMENT
              </p>
              <h3 className="mt-2 font-serif text-3xl">Customer Orders</h3>
              <p className="mt-2 text-sm text-black/50">
                View COD orders, customer details and update delivery progress.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border border-black/10 bg-white px-5 py-4">
                <ShoppingBag size={18} />
                <span className="text-sm">{orders.length} orders</span>
              </div>
              <button
                type="button"
                onClick={loadOrders}
                disabled={ordersLoading}
                className="flex h-[54px] w-[54px] items-center justify-center border border-black/10 bg-white hover:bg-[#eee] disabled:opacity-50"
                aria-label="Refresh orders"
              >
                <RefreshCw size={18} className={ordersLoading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {ordersLoading ? (
            <div className="border border-black/10 bg-white p-10 text-center text-sm text-black/50">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="border border-dashed border-black/20 bg-white py-16 text-center">
              <ShoppingBag size={32} className="mx-auto text-black/30" />
              <p className="mt-4 font-serif text-2xl">No orders found</p>
              <p className="mt-2 text-xs text-black/50">
                New customer orders will appear here after checkout.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order) => {
                const customer = Array.isArray(order.customers)
                  ? order.customers[0]
                  : order.customers;
                const address = order.shipping_address || {};
                const addressText = [
                  address.fullName,
                  address.address,
                  address.city,
                  address.state,
                  address.pincode,
                  address.pinCode,
                  address.phone,
                ]
                  .filter(Boolean)
                  .map(String)
                  .join(", ");

                return (
                  <article
                    key={order.id}
                    className="border border-black/10 bg-white p-5 md:p-7"
                  >
                    <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-5 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-[10px] tracking-[2px] text-[#a17b55]">
                          ORDER #{order.order_number}
                        </p>
                        <p className="mt-2 text-xs text-black/45">
                          {new Date(order.created_at).toLocaleString("en-IN")}
                        </p>
                        <p className="mt-3 text-sm font-semibold">
                          {customer?.full_name || String(address.fullName || "Customer")}
                        </p>
                        <p className="mt-1 text-xs text-black/55">
                          {customer?.phone || String(address.phone || "No phone provided")}
                          {customer?.email ? ` · ${customer.email}` : ""}
                        </p>
                      </div>

                      <div className="sm:text-right">
                        <p className="text-[10px] tracking-[2px] text-black/45">
                          PAYMENT
                        </p>
                        <p className="mt-1 text-xs font-semibold">
                          {order.payment_method || "Cash on Delivery"}
                        </p>
                        <p className="mt-3 font-serif text-2xl">
                          ₹{Number(order.total_amount || 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-6 py-5 md:grid-cols-2">
                      <div>
                        <p className="mb-3 text-[10px] tracking-[2px] text-black/45">
                          ITEMS ORDERED
                        </p>
                        <div className="space-y-3">
                          {(order.order_items || []).map((item) => (
                            <div key={item.id} className="flex justify-between gap-4 text-xs">
                              <div>
                                <p className="font-medium">{item.product_name}</p>
                                <p className="mt-1 text-black/45">
                                  Qty: {item.quantity}
                                  {item.selected_size ? ` · Size: ${item.selected_size}` : ""}
                                  {item.selected_color ? ` · Colour: ${item.selected_color}` : ""}
                                </p>
                              </div>
                              <p className="whitespace-nowrap">
                                ₹{(Number(item.unit_price) * item.quantity).toLocaleString("en-IN")}
                              </p>
                            </div>
                          ))}
                          {(!order.order_items || order.order_items.length === 0) && (
                            <p className="text-xs text-black/45">
                              Item details are not available.
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="mb-3 text-[10px] tracking-[2px] text-black/45">
                          DELIVERY ADDRESS
                        </p>
                        <p className="text-xs leading-6 text-black/65">
                          {addressText || "Address details not available"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between gap-3 border-t border-black/10 pt-5 sm:flex-row sm:items-center">
                      <div>
                        <p className="text-[10px] tracking-[2px] text-black/45">
                          ORDER STATUS
                        </p>
                        <p className="mt-1 text-xs font-semibold">
                          {order.order_status || "New Order"}
                        </p>
                      </div>

                      <select
                        value={ORDER_STATUSES.includes(order.order_status as (typeof ORDER_STATUSES)[number])
                          ? order.order_status
                          : "New Order"}
                        disabled={updatingOrderId === order.id}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="border border-black/20 bg-white px-4 py-3 text-xs outline-none focus:border-[#a17b55] disabled:opacity-50"
                        aria-label={`Update status for order ${order.order_number}`}
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Product form */}
        <section className="border border-black/10 bg-white p-5 md:p-8">
          <div className="mb-7 flex items-center justify-between">
            <div>
              <p className="text-[10px] tracking-[3px] text-[#a17b55]">
                PRODUCT CATALOGUE
              </p>
              <h3 className="mt-2 font-serif text-2xl">
                {editingId ? "Edit product" : "Add a new product"}
              </h3>
            </div>

            {editingId && (
              <button
                onClick={resetForm}
                className="flex items-center gap-2 text-xs text-black/50"
              >
                <X size={16} /> Cancel edit
              </button>
            )}
          </div>

          <form onSubmit={saveProduct} className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-xs">Product name *</label>
              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                placeholder="Example: Premium Cotton Shirt"
                className="admin-input"
              />
            </div>

            <div>
              <label className="text-xs">Category *</label>
              <select
                required
                value={form.category_id}
                onChange={(e) =>
                  setForm({ ...form, category_id: e.target.value })
                }
                className="admin-input"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs">Price (₹) *</label>
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: e.target.value })
                }
                placeholder="1499"
                className="admin-input"
              />
            </div>

            <div>
              <label className="text-xs">Available stock *</label>
              <input
                required
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(e) =>
                  setForm({ ...form, stock: e.target.value })
                }
                placeholder="20"
                className="admin-input"
              />
            </div>

            <div>
              <label className="text-xs">Sizes</label>
              <input
                value={form.sizes}
                onChange={(e) =>
                  setForm({ ...form, sizes: e.target.value })
                }
                placeholder="S, M, L, XL, XXL"
                className="admin-input"
              />
              <p className="mt-1 text-[10px] text-black/40">
                Separate sizes using commas.
              </p>
            </div>

            <div>
              <label className="text-xs">Colours</label>
              <input
                value={form.colors}
                onChange={(e) =>
                  setForm({ ...form, colors: e.target.value })
                }
                placeholder="Black, White, Blue"
                className="admin-input"
              />
              <p className="mt-1 text-[10px] text-black/40">
                Separate colours using commas.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs">Product description</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Describe the fabric, fit and product details..."
                className="admin-input resize-y"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs">Product image *</label>
              <label
                htmlFor="product-image"
                className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-black/25 bg-[#f7f5f0] px-5 py-9 text-center hover:border-[#a17b55]"
              >
                <Upload size={24} />
                <span className="text-xs">
                  {imageFile
                    ? imageFile.name
                    : "Choose a product image"}
                </span>
                <span className="text-[10px] text-black/45">
                  JPG, PNG or WEBP · Maximum 5 MB
                </span>
                <input
                  id="product-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setImageFile(e.target.files?.[0] || null)
                  }
                />
              </label>

              {existingImage && !imageFile && (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={existingImage}
                    alt="Current product"
                    className="h-20 w-16 object-cover"
                  />
                  <span className="text-xs text-black/50">
                    Current product image. Select a new image to replace it.
                  </span>
                </div>
              )}

              {imageFile && (
                <p className="mt-2 text-xs text-green-700">
                  New image selected: {imageFile.name}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 md:col-span-2">
              <input
                id="active-product"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
              />
              <label htmlFor="active-product" className="text-xs">
                Make this product visible in the storefront
              </label>
            </div>

            <div className="flex flex-wrap gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-3 bg-[#171614] px-8 py-4 text-xs tracking-[2px] text-white hover:bg-[#a17b55] disabled:opacity-50"
              >
                <Plus size={16} />
                {saving
                  ? "SAVING..."
                  : editingId
                    ? "UPDATE PRODUCT"
                    : "ADD PRODUCT"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="border border-black/20 px-8 py-4 text-xs tracking-[2px] hover:bg-[#f7f5f0]"
              >
                CLEAR
              </button>
            </div>
          </form>
        </section>

        {/* Product list */}
        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-serif text-3xl">Your products</h3>
            <span className="text-xs text-black/45">
              {products.length} total
            </span>
          </div>

          {products.length === 0 ? (
            <div className="border border-dashed border-black/20 bg-white py-20 text-center">
              <Package size={35} className="mx-auto text-black/30" />
              <p className="mt-4 font-serif text-2xl">
                No products yet
              </p>
              <p className="mt-2 text-xs text-black/50">
                Add your first clothing product using the form above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-black/10 bg-white">
              <table className="w-full min-w-[720px] text-left">
                <thead className="bg-[#eeece6] text-[10px] tracking-[2px]">
                  <tr>
                    <th className="p-4">PRODUCT</th>
                    <th className="p-4">PRICE</th>
                    <th className="p-4">STOCK</th>
                    <th className="p-4">STATUS</th>
                    <th className="p-4">ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-t border-black/10"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-16 w-12 object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-12 items-center justify-center bg-[#eee]">
                              <Package size={18} />
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-medium">
                              {product.name}
                            </p>
                            <p className="mt-1 text-[10px] text-black/45">
                              {categories.find(
                                (c) => c.id === product.category_id
                              )?.name || "Uncategorised"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-xs">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </td>

                      <td className="p-4 text-xs">{product.stock}</td>

                      <td className="p-4">
                        <span
                          className={`text-[10px] ${
                            product.is_active
                              ? "text-green-700"
                              : "text-red-600"
                          }`}
                        >
                          {product.is_active ? "ACTIVE" : "HIDDEN"}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => editProduct(product)}
                            className="text-black/60 hover:text-[#a17b55]"
                            aria-label="Edit product"
                          >
                            <Edit size={17} />
                          </button>

                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="text-black/60 hover:text-red-600"
                            aria-label="Delete product"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .admin-input {
          display: block;
          width: 100%;
          margin-top: 9px;
          border: 1px solid rgba(0, 0, 0, 0.18);
          background: transparent;
          padding: 13px;
          font-size: 13px;
          outline: none;
        }

        .admin-input:focus {
          border-color: #a17b55;
        }
      `}</style>
    </main>
  );
}
