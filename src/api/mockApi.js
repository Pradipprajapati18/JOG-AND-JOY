import { supabase } from '../lib/supabase';

// Helper to handle Supabase errors
const handleResponse = (response) => {
  if (response.error) {
    console.error('Supabase Error:', response.error);
    throw new Error(response.error.message);
  }
  return response.data;
};

export async function list(table, params = {}) {
  const { page = 1, pageSize = 20, sort, ...filters } = params;

  let query = supabase.from(table).select('*', { count: 'exact' });

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === '' || value === null) return;
    
    if (key === 'search') {
      // Very basic text search (Note: For real apps, you'd configure Full Text Search in Postgres)
      // This is a placeholder since Supabase doesn't support generic JSON stringify search natively
      // You'd typically search specific columns like `title.ilike.%${value}%`
      // For now, we'll try to find an 'id' or 'name' or 'title' match
      query = query.or(`id.ilike.%${value}%,title.ilike.%${value}%,name.ilike.%${value}%`);
    } else if (Array.isArray(value)) {
      query = query.in(key, value);
    } else {
      query = query.eq(key, value);
    }
  });

  // Apply sorting
  if (sort) {
    const dir = sort.startsWith('-') ? false : true;
    const key = sort.replace('-', '');
    query = query.order(key, { ascending: dir });
  } else {
    // Default sort by createdAt desc
    query = query.order('createdAt', { ascending: false });
  }

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  
  if (error) {
    console.error(`Supabase List Error [${table}]:`, error);
    throw new Error(error.message);
  }

  return { data, total: count || 0, page, pageSize };
}

export async function get(table, id) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Supabase Get Error [${table}]:`, error);
    throw new Error(error.message);
  }
  return data;
}

export async function create(table, payload) {
  const now = new Date().toISOString();
  
  // Clean payload from undefined values which Supabase rejects
  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => v !== undefined)
  );

  if (!cleanPayload.id) {
    cleanPayload.id = crypto.randomUUID();
  }
  
  // Temporary fix for schema cache issue
  if (table === 'orders' && cleanPayload.channel !== undefined) {
    delete cleanPayload.channel;
  }
  
  const record = { 
    ...cleanPayload,
    createdAt: now, 
    updatedAt: now
  };

  // The sizes table doesn't have an updatedAt column
  if (table === 'sizes') {
    delete record.updatedAt;
  }

  let query = supabase.from(table).insert([record]);
  
  // Guest orders will fail RLS if we try to SELECT after INSERT. 
  // We can safely omit the select for orders since we already know the payload.
  if (table !== 'orders') {
    query = query.select().single();
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Supabase Create Error [${table}]:`, error);
    throw new Error(error.message);
  }
  
  return data || record;
}

export async function update(table, id, patch) {
  const cleanPatch = Object.fromEntries(
    Object.entries(patch).filter(([_, v]) => v !== undefined)
  );

  const updateData = { ...cleanPatch, updatedAt: new Date().toISOString() };
  if (table === 'sizes') {
    delete updateData.updatedAt;
  }

  const { data, error } = await supabase
    .from(table)
    .update(updateData)
    .eq('id', id)
    .select();

  if (error) {
    console.error(`Supabase Update Error [${table}]:`, error);
    throw new Error(error.message);
  }
  
  // Return the first item or a fallback if RLS blocked the select return
  return data && data.length > 0 ? data[0] : { id, ...cleanPatch };
}

export async function remove(table, id) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Supabase Delete Error [${table}]:`, error);
    throw new Error(error.message);
  }
  return { id };
}
