import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env manually
const envPath = path.resolve('.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length > 0) {
      process.env[key.trim()] = values.join('=').trim();
    }
  });
}

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

// Mock products
const PRODUCTS = [
  {
    name: "Classic Boy's Bio-Wash Tee",
    price: 399,
    originalPrice: 599,
    rating: 4.8,
    reviews: 124,
    images: [
      "https://images.unsplash.com/photo-1519238263530-99bea67b5115?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1519238128362-e64fcb9195b0?auto=format&fit=crop&q=80&w=600"
    ],
    category: "Boys",
    ageGroup: "6–8 Years",
    material: "100% Bio-Wash Cotton",
    tag: "Best Seller",
    status: "active",
    colors: ["Navy Blue", "Crimson Red", "Forest Green"],
    variants: [
      { size: "5-6Y", sku: "BT-NV-5", stock: 15 },
      { size: "7-8Y", sku: "BT-NV-7", stock: 8 },
      { size: "9-10Y", sku: "BT-NV-9", stock: 12 },
    ]
  },
  {
    name: "Playful Girl's Floral Frock",
    price: 699,
    originalPrice: 999,
    rating: 4.9,
    reviews: 89,
    images: [
      "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1622290319146-7b63df48a635?auto=format&fit=crop&q=80&w=600"
    ],
    category: "Girls",
    ageGroup: "3–5 Years",
    material: "Soft Cotton Blend",
    tag: "New Arrival",
    status: "active",
    colors: ["Rose Pink", "Sunshine Yellow"],
    variants: [
      { size: "3-4Y", sku: "GF-PK-3", stock: 5 },
      { size: "5-6Y", sku: "GF-PK-5", stock: 2 },
    ]
  },
  {
    name: "Men's Premium Cotton Joggers",
    price: 899,
    originalPrice: 1299,
    rating: 4.7,
    reviews: 210,
    images: [
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1517423568366-8b83523034fd?auto=format&fit=crop&q=80&w=600"
    ],
    category: "Men's Collection",
    material: "Cotton Fleece",
    status: "active",
    colors: ["Heather Grey", "Black", "Olive"],
    variants: [
      { size: "M", sku: "MJ-GY-M", stock: 25 },
      { size: "L", sku: "MJ-GY-L", stock: 30 },
      { size: "XL", sku: "MJ-GY-XL", stock: 15 },
    ]
  },
  {
    name: "Women's Activewear Set",
    price: 1299,
    originalPrice: 1899,
    rating: 4.6,
    reviews: 156,
    images: [
      "https://images.unsplash.com/photo-1608228079968-c7681eaef812?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600"
    ],
    category: "Girls", // Mapped for female
    material: "Spandex Blend",
    status: "active",
    colors: ["Teal", "Mauve", "Black"],
    variants: [
      { size: "S", sku: "WA-TL-S", stock: 10 },
      { size: "M", sku: "WA-TL-M", stock: 22 },
      { size: "L", sku: "WA-TL-L", stock: 8 },
    ]
  }
];

async function seedProducts() {
  console.log('Seeding products to Supabase...');
  
  for (const product of PRODUCTS) {
    const dbProduct = {
      id: crypto.randomUUID(),
      title: product.name,
      basePrice: product.price,
      compareAtPrice: product.originalPrice,
      image: product.images[0],
      categoryId: product.category,
      productType: product.tag,
      status: product.status,
      variants: product.variants,
      seoTitle: product.name,
      seoDescription: `${product.material} - ${product.ageGroup}`,
      // Storefront specific fields we'll tuck into variants or a new JSONB or just rely on the UI not crashing if they are missing
    };

    const { data, error } = await supabase.from('products').insert([dbProduct]);
    if (error) {
      console.error(`Error inserting ${product.name}:`, error.message);
    } else {
      console.log(`Inserted ${product.name}`);
    }
  }
  
  console.log('Done!');
}

seedProducts();
