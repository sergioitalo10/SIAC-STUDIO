"use client";

import { useRouter } from "next/navigation";
import { Product, products } from "@/data/products";
import { useCart } from "@/context/CartContext";

type AddToCartButtonProps = {
  product: Product;
};

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const router = useRouter();

  function handleAddToCart() {
    // Garante que pega o produto real diretamente do catálogo oficial pelo ID, incluindo o arquivo .rar correto
    const produtoOficial = products.find((p) => p.id === product.id) || product;

    addToCart(produtoOficial);
    router.push("/carrinho");
  }

  return (
    <button
      onClick={handleAddToCart}
      className="mt-8 rounded-lg bg-blue-600 px-8 py-4 font-semibold transition hover:bg-blue-500 cursor-pointer"
    >
      Adicionar ao carrinho
    </button>
  );
}