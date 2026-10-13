import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testPromo() {
  const { data, error } = await supabase.rpc('exec_sql', { query: 'SELECT column_name FROM information_schema.columns WHERE table_name = \'promotions\';' });
  if (error) {
    console.log("RPC Error:", error.message);
  } else {
    console.log("Columns:", data);
  }
}

testPromo();
