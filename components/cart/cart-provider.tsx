"use client";

import * as React from "react";
import { useUser } from "@clerk/nextjs";

import {
  addToCartAction,
  clearCartAction,
  getCartSnapshotAction,
  mergeGuestCartAction,
  removeCartItemAction,
  updateCartItemQuantityAction
} from "@/actions/cart/actions";
import type { CartSnapshot } from "@/lib/db/types";
import { useToast } from "@/components/ui/toast";

const GUEST_CART_KEY = "veloure.guest-cart.v1";

export type CartUiLine = {
  itemId: string;
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  variantName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  stock?: number;
  isServerLine: boolean;
};

export type AddCartLineInput = Omit<CartUiLine, "itemId" | "lineTotal" | "isServerLine"> & {
  quantity: number;
};

type CartContextValue = {
  lines: CartUiLine[];
  subtotal: number;
  shipping: number;
  total: number;
  isOpen: boolean;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  addLine: (line: AddCartLineInput) => Promise<void>;
  updateLine: (itemId: string, quantity: number) => Promise<void>;
  removeLine: (itemId: string) => Promise<void>;
  clear: () => Promise<void>;
};

const CartContext = React.createContext<CartContextValue | null>(null);

function mapSnapshot(snapshot: CartSnapshot): CartUiLine[] {
  return snapshot.lines.map((line) => ({
    itemId: line.id,
    productId: line.product_id,
    variantId: line.variant_id,
    name: line.product.name,
    slug: line.product.slug,
    imageUrl: line.variant.image_url ?? line.product.main_image_url,
    variantName: `${line.variant.color} / ${line.variant.size}`,
    sku: line.variant.sku,
    unitPrice: Number(line.unit_price_snapshot),
    quantity: line.quantity,
    lineTotal: line.line_total,
    stock: line.variant.stock_quantity,
    isServerLine: true
  }));
}

function readGuestLines() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_CART_KEY);
    return raw ? (JSON.parse(raw) as CartUiLine[]) : [];
  } catch {
    return [];
  }
}

function writeGuestLines(lines: CartUiLine[]) {
  window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(lines));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useUser();
  const { toast } = useToast();
  const [lines, setLines] = React.useState<CartUiLine[]>([]);
  const [serverTotals, setServerTotals] = React.useState({ subtotal: 0, shipping: 0, total: 0 });
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const loadServerCart = React.useCallback(async () => {
    if (!isSignedIn) return;
    setIsLoading(true);
    const result = await getCartSnapshotAction();
    setIsLoading(false);
    if (result.ok) {
      setLines(mapSnapshot(result.data));
      setServerTotals({ subtotal: result.data.subtotal, shipping: result.data.shipping, total: result.data.total });
    }
  }, [isSignedIn]);

  React.useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      const guestLines = readGuestLines();
      setLines(guestLines);
      const subtotal = guestLines.reduce((sum, line) => sum + line.lineTotal, 0);
      setServerTotals({ subtotal, shipping: 0, total: subtotal });
      return;
    }

    const guestLines = readGuestLines();
    if (guestLines.length > 0) {
      setIsLoading(true);
      mergeGuestCartAction({
        lines: guestLines.map((line) => ({
          productId: line.productId,
          variantId: line.variantId,
          quantity: line.quantity
        }))
      }).then((result) => {
        setIsLoading(false);
        window.localStorage.removeItem(GUEST_CART_KEY);
        if (result.ok) {
          setLines(mapSnapshot(result.data));
          setServerTotals({ subtotal: result.data.subtotal, shipping: result.data.shipping, total: result.data.total });
          toast({ title: "Cart synced", description: "Your saved cart was moved into your account." });
        } else {
          toast({ title: "Cart sync failed", description: result.error, variant: "destructive" });
          loadServerCart();
        }
      });
      return;
    }

    loadServerCart();
  }, [isLoaded, isSignedIn, loadServerCart, toast]);

  const setGuestState = React.useCallback((next: CartUiLine[]) => {
    writeGuestLines(next);
    setLines(next);
    const subtotal = next.reduce((sum, line) => sum + line.lineTotal, 0);
    setServerTotals({ subtotal, shipping: 0, total: subtotal });
  }, []);

  const addLine = React.useCallback(
    async (line: AddCartLineInput) => {
      if (isSignedIn) {
        setIsLoading(true);
        const result = await addToCartAction({
          productId: line.productId,
          variantId: line.variantId,
          quantity: line.quantity
        });
        setIsLoading(false);
        if (result.ok) {
          setLines(mapSnapshot(result.data));
          setServerTotals({ subtotal: result.data.subtotal, shipping: result.data.shipping, total: result.data.total });
          toast({ title: "Added to cart", description: line.name });
          setIsOpen(true);
        } else {
          toast({ title: "Could not add item", description: result.error, variant: "destructive" });
        }
        return;
      }

      const current = readGuestLines();
      const existing = current.find((item) => item.variantId === line.variantId);
      const next = existing
        ? current.map((item) =>
            item.variantId === line.variantId
              ? {
                  ...item,
                  quantity: Math.min(99, item.quantity + line.quantity),
                  lineTotal: Math.min(99, item.quantity + line.quantity) * item.unitPrice
                }
              : item
          )
        : [
            ...current,
            {
              ...line,
              itemId: line.variantId,
              lineTotal: line.unitPrice * line.quantity,
              isServerLine: false
            }
          ];
      setGuestState(next);
      toast({ title: "Added to cart", description: line.name });
      setIsOpen(true);
    },
    [isSignedIn, setGuestState, toast]
  );

  const updateLine = React.useCallback(
    async (itemId: string, quantity: number) => {
      if (isSignedIn) {
        const result = await updateCartItemQuantityAction({ itemId, quantity });
        if (result.ok) {
          setLines(mapSnapshot(result.data));
          setServerTotals({ subtotal: result.data.subtotal, shipping: result.data.shipping, total: result.data.total });
        } else {
          toast({ title: "Cart update failed", description: result.error, variant: "destructive" });
        }
        return;
      }

      const next = readGuestLines().map((line) =>
        line.itemId === itemId ? { ...line, quantity, lineTotal: quantity * line.unitPrice } : line
      );
      setGuestState(next);
    },
    [isSignedIn, setGuestState, toast]
  );

  const removeLine = React.useCallback(
    async (itemId: string) => {
      if (isSignedIn) {
        const result = await removeCartItemAction(itemId);
        if (result.ok) {
          setLines(mapSnapshot(result.data));
          setServerTotals({ subtotal: result.data.subtotal, shipping: result.data.shipping, total: result.data.total });
        } else {
          toast({ title: "Remove failed", description: result.error, variant: "destructive" });
        }
        return;
      }

      setGuestState(readGuestLines().filter((line) => line.itemId !== itemId));
    },
    [isSignedIn, setGuestState, toast]
  );

  const clear = React.useCallback(async () => {
    if (isSignedIn) {
      const result = await clearCartAction();
      if (result.ok) {
        setLines([]);
        setServerTotals({ subtotal: 0, shipping: 0, total: 0 });
      }
      return;
    }
    setGuestState([]);
  }, [isSignedIn, setGuestState]);

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);

  return (
    <CartContext.Provider
      value={{
        lines,
        subtotal: isSignedIn ? serverTotals.subtotal : subtotal,
        shipping: isSignedIn ? serverTotals.shipping : 0,
        total: isSignedIn ? serverTotals.total : subtotal,
        isOpen,
        isLoading,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addLine,
        updateLine,
        removeLine,
        clear
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = React.useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider.");
  return context;
}
