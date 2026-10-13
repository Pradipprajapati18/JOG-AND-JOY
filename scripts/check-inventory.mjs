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

async function check() {
  console.log("Fetching products from Supabase to check inventory sync...");
  const { data: products, error } = await supabase.from('products').select('id, title, stock, variants');
  
  if (error) {
    console.error("Error fetching products:", error);
    process.exit(1);
  }

  let issues = 0;
  for (const p of products) {
    if (p.variants && Array.isArray(p.variants) && p.variants.length > 0) {
      const sum = p.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
      if (sum !== Number(p.stock)) {
        console.log(`❌ OUT OF SYNC: "${p.name || p.title}" (ID: ${p.id})`);
        console.log(`   - Top-level stock: ${p.stock}`);
        console.log(`   - Sum of variants: ${sum}\n`);
        issues++;
        
        // Let's fix it automatically for the user
        console.log(`   🛠️ Auto-fixing... updating top-level stock to ${sum}`);
        await supabase.from('products').update({ stock: sum }).eq('id', p.id);
      }
    }
  }
  
  if (issues === 0) {
    console.log("✅ All products are perfectly in sync!");
  } else {
    console.log(`\n🎉 Fixed ${issues} out-of-sync products.`);
  }
}

check();
