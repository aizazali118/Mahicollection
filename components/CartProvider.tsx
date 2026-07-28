"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  variantId?: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  variantLabel?: string;
  stock: number;
};

type AddItemInput = Omit<CartItem, "key" | "quantity"> & {
  quantity?: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  ready: boolean;
  addItem: (item: AddItemInput) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "mahi_collection_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let initialItems: CartItem[] = [];
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[];
        if (Array.isArray(parsed)) initialItems = parsed;
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    const hydration = window.setTimeout(() => {
      setItems(initialItems);
      setReady(true);
    }, 0);

    return () => window.clearTimeout(hydration);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const flash = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2400);
  }, []);

  const addItem = useCallback(
    (input: AddItemInput) => {
      const key = `${input.productId}:${input.variantId || "single"}`;
      const quantity = Math.max(1, input.quantity || 1);

      setItems((current) => {
        const existing = current.find((item) => item.key === key);
        if (existing) {
          return current.map((item) =>
            item.key === key
              ? {
                  ...item,
                  quantity: Math.min(
                    Math.max(1, item.quantity + quantity),
                    Math.max(1, input.stock)
                  )
                }
              : item
          );
        }

        return [
          ...current,
          {
            ...input,
            key,
            quantity: Math.min(quantity, Math.max(1, input.stock))
          }
        ];
      });

      flash(`${input.title} added to your bag.`);
    },
    [flash]
  );

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((current) =>
      current.map((item) =>
        item.key === key
          ? {
              ...item,
              quantity: Math.min(
                Math.max(1, quantity),
                Math.max(1, item.stock)
              )
            }
          : item
      )
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((current) => current.filter((item) => item.key !== key));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
      ready,
      addItem,
      updateQuantity,
      removeItem,
      clearCart
    }),
    [items, ready, addItem, updateQuantity, removeItem, clearCart]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {notice ? <div className="cart-toast">{notice}</div> : null}
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
