"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { Product } from "@/data/products";
import type { DesignerProduct } from "@/types/designer";

type CartContextType = {
  cart: (Product | DesignerProduct)[];
  addToCart: (product: Product | DesignerProduct) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "siac-studio-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<(Product | DesignerProduct)[]>([]);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);

      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Erro ao carregar carrinho:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("Erro ao salvar carrinho:", error);
    }
  }, [cart]);

  function addToCart(product: Product | DesignerProduct) {
    setCart((currentCart) => {
      const productId: number | undefined =
        'artwork_id' in product ? product.artwork_id : product.id;
      if (productId == null) return currentCart;

      const existingProduct = currentCart.find(
        (item) =>
          ('artwork_id' in item ? item.artwork_id : item.id) === productId
      );

      if (existingProduct) {
        return currentCart;
      }

      return [...currentCart, product];
    });
  }

  function removeFromCart(productId: number) {
    setCart((currentCart) =>
      currentCart.filter(
        (product) =>
          ('artwork_id' in product ? product.artwork_id : product.id) === productId
      )
    );
  }

  function clearCart() {
    setCart([]);
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart deve ser usado dentro de CartProvider");
  }

  return context;
}
