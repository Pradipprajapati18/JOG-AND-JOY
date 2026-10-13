import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envContent = fs.existsSync(join(__dirname, '../.env.local')) 
  ? fs.readFileSync(join(__dirname, '../.env.local'), 'utf-8')
  : fs.readFileSync(join(__dirname, '../.env'), 'utf-8');
const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const supabaseKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkImages() {
  console.log("Fetching products to analyze image coverage...");
  const { data: products, error } = await supabase.from('products').select('id, title, image, images, variants');
  
  if (error) {
    console.error("Error fetching products:", error);
    process.exit(1);
  }

  let totalProducts = products.length;
  let missingParentImages = 0;
  let missingVariantImages = 0;
  let totalVariants = 0;
  
  for (const p of products) {
    // Check parent product image
    const hasParentImage = (p.image && p.image.trim() !== '') || (p.images && p.images.length > 0);
    if (!hasParentImage) {
      console.log(`⚠️  Product missing image: "${p.title}" (ID: ${p.id})`);
      missingParentImages++;
    }

    // Check variant images
    if (p.variants && Array.isArray(p.variants)) {
      totalVariants += p.variants.length;
      let missingInProduct = 0;
      for (const v of p.variants) {
        if (!v.image || v.image.trim() === '') {
          missingInProduct++;
        }
      }
      if (missingInProduct > 0) {
        console.log(`⚠️  Product variants missing images: "${p.title}" (${missingInProduct}/${p.variants.length} variants missing image)`);
        missingVariantImages += missingInProduct;
      }
    }
  }
  
  console.log("\n--- Image Coverage Report ---");
  console.log(`Total Products: ${totalProducts}`);
  console.log(`Products Missing Main Image: ${missingParentImages}`);
  console.log(`Total Variants: ${totalVariants}`);
  console.log(`Variants Missing Image: ${missingVariantImages}`);
  
  if (missingParentImages === 0 && missingVariantImages === 0) {
    console.log("✅ All products and variants have images assigned!");
  }
}

checkImages();
