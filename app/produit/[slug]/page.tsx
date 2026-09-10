import type { Metadata } from "next";
import { getProduct } from "@/lib/products";
import ProductPageClient from "./ProductPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) {
    return { title: "Produit introuvable" };
  }

  return {
    title: { absolute: product.name },
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
    },
    twitter: {
      title: product.name,
      description: product.description,
    },
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ c?: string }>;
}) {
  const { slug } = await params;
  const { c } = await searchParams;

  return <ProductPageClient slug={slug} colorParam={c} />;
}