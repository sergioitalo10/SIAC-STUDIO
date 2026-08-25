"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartButton() {
  const { cart } = useCart();

  return (
    <Link
      href="/carrinho"
      className="relative text-xl transition hover:text-blue-500"
    >
      🛒

      {cart.length > 0 && (
        <span className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-bold text-white">
          {cart.length}
        </span>
      )}
    </Link>
  );
}