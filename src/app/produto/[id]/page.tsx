
import { products } from "@/data/products";
import AddToCartButton from "@/components/AddToCartButton";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;

  const product = products.find(
    (item) => item.id === Number(id)
  );

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <h1 className="text-3xl font-bold">
          Produto não encontrado
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">

      <div className="mx-auto max-w-7xl px-6 py-16">

        <div className="grid gap-10 md:grid-cols-2">

          <div className="overflow-hidden rounded-2xl border border-gray-800">
            <img
              src={product.imagem}
              alt={product.nome}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-center">

            <p className="text-sm font-semibold uppercase tracking-wider text-blue-500">
              {product.categoria}
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              {product.nome}
            </h1>

            <p className="mt-6 text-gray-400">
              {product.descricao}
            </p>

            <p className="mt-8 text-3xl font-bold text-blue-500">
              R$ {product.preco.toFixed(2).replace(".", ",")}
            </p>

            <AddToCartButton product={product} />

          </div>

        </div>

      </div>

    </main>
  );
}