import * as mockApi from '../mockApi';
import { supabase } from '../../lib/supabase';

const TABLE = 'customers';

export const customersApi = {
  list: (params) => mockApi.list(TABLE, params),
  get: (id) => mockApi.get(TABLE, id),
  create: (payload) => mockApi.create(TABLE, payload),
  update: (id, patch) => mockApi.update(TABLE, id, patch),
  remove: (id) => mockApi.remove(TABLE, id),

  upsertByEmail: async (email, data, orderAmount = 0) => {
    if (!email) throw new Error("Email is required for upsert");

    // First check if exists
    const { data: existing, error: getError } = await supabase
      .from(TABLE)
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (getError && getError.code !== 'PGRST116') {
      console.error("Error fetching customer:", getError);
      throw getError;
    }

    if (existing) {
      // Update
      const { data: updated, error: updateError } = await supabase
        .from(TABLE)
        .update({ 
          ...data, 
          totalOrders: (existing.totalOrders || 0) + 1,
          totalSpent: (parseFloat(existing.totalSpent) || 0) + orderAmount,
          updatedAt: new Date().toISOString() 
        })
        .eq('email', email)
        .select()
        .single();
      
      if (updateError) throw updateError;
      return updated;
    } else {
      // Create
      const now = new Date().toISOString();
      const newId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
      const record = { 
        ...data, 
        id: data.id || newId,
        email, 
        totalOrders: 1,
        totalSpent: orderAmount,
        createdAt: now, 
        updatedAt: now 
      };

      const { data: created, error: createError } = await supabase
        .from(TABLE)
        .insert([record])
        .select()
        .single();

      if (createError) {
        // Fallback for RLS guest issues if needed
        return record;
      }
      return created;
    }
  }
};
