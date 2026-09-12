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
    price: "39,90 €",
    priceValue: 39.90,
    preorderGoal: 20,
    description:
      "La rose : une beauté qui se mérite, qui pique avant de séduire. Un tee-shirt en coton épais 180g/m², logo AJVEK brodé sur le devant, motif Roses imprimé en DTF dans le dos. Pièce en édition limitée, fabriquée en petite série.",
    sizes: ["S", "M", "L", "XL"],
    colorways: [
      {
        label: "Noir",
        color: "#1c1a18",
        frontTexture: "/decals/ajk-blanc.png",
        backTexture: "/decals/roses-blanc.png",
        backScale: [0.106, 0.4, 0.09],
      },
      {
        label: "Blanc",
        color: "#f4f1ea",
        frontTexture: "/decals/ajk.png",
        backTexture: "/decals/roses.png",
        backScale: [0.106, 0.4, 0.09],
      },
    ],
  },
  {
    slug: "sakura",
    name: "AJVEK · Sakura",
    price: "39,90 €",
    priceValue: 39.90,
    preorderGoal: 20,
    description:
      "Le cerisier : une grâce qui ne dure qu'un instant. Un tee-shirt en coton épais 180g/m², logo AJVEK brodé sur le devant, motif Sakura imprimé en DTF dans le dos. Pièce en édition limitée, fabriquée en petite série.",
    sizes: ["S", "M", "L", "XL"],
    colorways: [
      {
        label: "Noir",
        color: "#1c1a18",
        frontTexture: "/decals/ajk-blanc.png",
        backTexture: "/decals/sakura-blanc.png",
        backScale: [0.24, 0.36, 0.09],
      },
      {
        label: "Blanc",
        color: "#f4f1ea",
        frontTexture: "/decals/ajk.png",
        backTexture: "/decals/sakura.png",
        backScale: [0.24, 0.36, 0.09],
      },
    ],
  },
];

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}
