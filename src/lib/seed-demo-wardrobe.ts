/**
 * Sample wardrobe rows for the seeded demo user (`npm run db:seed`).
 * Uses public `/inspo/` assets as placeholder thumbnails.
 */
export const DEMO_WARDROBE_ROWS: {
  name: string;
  category: string;
  color: string;
  colorHex: string;
  seasons: string[];
  styles: string[];
  imageUrl: string;
  warmthLevel: number;
  waterproof: boolean;
  favorite: boolean;
}[] = [
  {
    name: "White Oxford Shirt",
    category: "tops",
    color: "White",
    colorHex: "#f4f4f5",
    seasons: ["spring", "summer", "fall"],
    styles: ["casual", "minimalist"],
    imageUrl: "/inspo/minimalist.jpg",
    warmthLevel: 2,
    waterproof: false,
    favorite: true,
  },
  {
    name: "Slim Navy Chinos",
    category: "bottoms",
    color: "Navy",
    colorHex: "#1e3a5f",
    seasons: ["spring", "fall", "winter"],
    styles: ["casual", "preppy"],
    imageUrl: "/inspo/smart-casual.jpg",
    warmthLevel: 2,
    waterproof: false,
    favorite: false,
  },
  {
    name: "Grey Hoodie",
    category: "tops",
    color: "Grey",
    colorHex: "#9ca3af",
    seasons: ["fall", "winter", "all"],
    styles: ["streetwear", "casual"],
    imageUrl: "/inspo/streetwear.jpg",
    warmthLevel: 3,
    waterproof: false,
    favorite: true,
  },
  {
    name: "Black Chelsea Boots",
    category: "shoes",
    color: "Black",
    colorHex: "#171717",
    seasons: ["fall", "winter", "spring"],
    styles: ["minimalist", "elegant"],
    imageUrl: "/inspo/formal.jpg",
    warmthLevel: 2,
    waterproof: true,
    favorite: false,
  },
  {
    name: "Beige Trench Coat",
    category: "outerwear",
    color: "Beige",
    colorHex: "#d6c4a8",
    seasons: ["spring", "fall"],
    styles: ["elegant", "minimalist"],
    imageUrl: "/inspo/formal.jpg",
    warmthLevel: 4,
    waterproof: true,
    favorite: true,
  },
  {
    name: "Flowy Midi Dress",
    category: "dresses",
    color: "Sage",
    colorHex: "#9caf88",
    seasons: ["spring", "summer"],
    styles: ["bohemian", "elegant"],
    imageUrl: "/inspo/boho.jpg",
    warmthLevel: 2,
    waterproof: false,
    favorite: false,
  },
  {
    name: "Vintage Denim Jacket",
    category: "outerwear",
    color: "Blue",
    colorHex: "#3b82f6",
    seasons: ["spring", "summer", "fall"],
    styles: ["vintage", "casual"],
    imageUrl: "/inspo/vintage.jpg",
    warmthLevel: 3,
    waterproof: false,
    favorite: true,
  },
  {
    name: "Running Sneakers",
    category: "shoes",
    color: "White",
    colorHex: "#fafafa",
    seasons: ["all"],
    styles: ["athletic", "casual"],
    imageUrl: "/inspo/streetwear.jpg",
    warmthLevel: 1,
    waterproof: false,
    favorite: false,
  },
];
