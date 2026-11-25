
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
  stock: number;
};

type CartContextType = {
  cart: CartItem[];
  cartCount: number;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  updateQuantity: (id: string, size: string, color: string, quantity: number) => void;
  removeFromCart: (id: string, size: string, color: string) => void;
  clearCart: () => void;
  hydrated: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("atelier-cart");
      if (saved) setCart(JSON.parse(saved));
    } catch {
      localStorage.removeItem("atelier-cart");
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem("atelier-cart", JSON.stringify(cart));
    }
  }, [cart, hydrated]);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCart((current) => {
      const existing = current.find(
        (p) => p.id === item.id && p.size === item.size && p.color === item.color
      );

      if (existing) {
        return current.map((p) =>
          p.id === item.id && p.size === item.size && p.color === item.color
            ? { ...p, quantity: Math.min(p.quantity + 1, p.stock) }
            : p
        );
      }

      if (item.stock <= 0) return current;
      return [...current, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (
    id: string,
    size: string,
    color: string,
    quantity: number
  ) => {
    setCart((current) =>
      current.map((item) =>
        item.id === id && item.size === size && item.color === color
          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) }
          : item
      )
    );
  };

  const removeFromCart = (id: string, size: string, color: string) => {
    setCart((current) =>
      current.filter(
        (item) => !(item.id === id && item.size === size && item.color === color)
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        hydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}