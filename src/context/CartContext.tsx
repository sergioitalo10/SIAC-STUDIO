"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "@/data/products";

type CartContextType = {
  cart: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Product[]>([]);

  function addToCart(product: Product) {
  setCart((currentCart) => {
    const alreadyExists = currentCart.some(
      (item) => item.id === product.id
    );

    if (alreadyExists) {
      return currentCart;
    }

    return [...currentCart, product];
  });
}

  function removeFromCart(productId: number) {
    setCart((currentCart) =>
      currentCart.filter((product) => product.id !== productId)
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