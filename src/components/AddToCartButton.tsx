"use client";

import { useRouter } from "next/navigation";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";

type AddToCartButtonProps = {
  product: Product;
};

export default function AddToCartButton({
  product,
}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const router = useRouter();

  function handleAddToCart() {
    addToCart(product);

    router.push("/carrinho");
  }

  return (
    <button
      onClick={handleAddToCart}
      className="mt-8 rounded-lg bg-blue-600 px-8 py-4 font-semibold transition hover:bg-blue-500"
    >
      Adicionar ao carrinho
    </button>
  );
}