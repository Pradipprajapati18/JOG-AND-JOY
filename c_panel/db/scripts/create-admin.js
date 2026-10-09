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

async function createAdmin() {
  console.log('🔄 Attempting to register Admin User...');
  
  const { data, error } = await supabase
    .from('users')
    .insert([{
      name: 'Niyati Thacker',
      email: 'niyati.thacker@gmail.com',
      password: 'niyatithacker',
      role: 'ADMIN'
    }])
    .select()
    .single();

  if (error) {
    console.error('❌ Registration Failed:');
    console.error(error.message);
  } else {
    console.log('✅ Admin User Registered Successfully in custom table!');
    console.log('User ID:', data.id);
    console.log('Email:', data.email);
    console.log('Role:', data.role);
  }
}

createAdmin();
