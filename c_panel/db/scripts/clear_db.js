import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function clearMockData() {
  console.log('Clearing mock data from Supabase...');
  
  const { error: err1 } = await supabase.from('products').delete().neq('id', '0');
  const { error: err2 } = await supabase.from('orders').delete().neq('id', '0');
  const { error: err3 } = await supabase.from('messages').delete().neq('id', '0');
  const { error: err4 } = await supabase.from('reviews').delete().neq('id', '0');

  if (err1) console.error('Error clearing products:', err1.message);
  if (err2) console.error('Error clearing orders:', err2.message);
  if (err3) console.error('Error clearing messages:', err3.message);
  if (err4) console.error('Error clearing reviews:', err4.message);

  console.log('Mock data cleared!');
}

clearMockData();
