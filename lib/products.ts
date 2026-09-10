export type Colorway = {
  label: string;
  color: string;
  frontTexture: string;
  backTexture: string;
  backScale: [number, number, number];
};

export type Product = {
  slug: string;
  name: string;
  price: string;
  priceValue: number;
  preorderGoal: number;
  description: string;
  sizes: string[];
  colorways: Colorway[];
};

export const PRODUCTS: Product[] = [
  {
    slug: "roses",
    name: "AJVEK · Roses",
    price: "45,00 €",
    priceValue: 45,
    preorderGoal: 20,
    description: "Description à venir — à remplacer par le vrai texte du produit.",
    sizes: ["S", "M", "L", "XL"],
    colorways: [
      { label: "Noir", color: "#1c1a18", frontTexture: "/decals/ajk-blanc.png", backTexture: "/decals/roses-blanc.png", backScale: [0.106, 0.4, 0.09] },
      { label: "Blanc", color: "#f4f1ea", frontTexture: "/decals/ajk.png", backTexture: "/decals/roses.png", backScale: [0.106, 0.4, 0.09] },
    ],
  },
  {
    slug: "sakura",
    name: "AJVEK · Sakura",
    price: "45,00 €",
    priceValue: 45,
    preorderGoal: 20,
    description: "Description à venir — à remplacer par le vrai texte du produit.",
    sizes: ["S", "M", "L", "XL"],
    colorways: [
      { label: "Noir", color: "#1c1a18", frontTexture: "/decals/ajk-blanc.png", backTexture: "/decals/sakura-blanc.png", backScale: [0.24, 0.36, 0.09] },
      { label: "Blanc", color: "#f4f1ea", frontTexture: "/decals/ajk.png", backTexture: "/decals/sakura.png", backScale: [0.24, 0.36, 0.09] },
    ],
  },
];

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}