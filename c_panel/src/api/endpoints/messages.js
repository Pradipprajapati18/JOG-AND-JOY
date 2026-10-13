import { supabase } from '../../lib/supabase';

const TABLE = 'messages';

export const messagesApi = {
  list: async (filters) => {
    let query = supabase.from(TABLE).select('*');
    if (filters?.status && filters.status !== 'all') {
      const statusMap = { 'open': 'unread' };
      query = query.eq('status', statusMap[filters.status] || filters.status);
    }
    const { data, error } = await query;
    if (error) throw error;
    
    let filteredData = data;
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      filteredData = data.filter(r => 
        (r.subject || '').toLowerCase().includes(q) || 
        (r.customerName || '').toLowerCase().includes(q) ||
        (r.customerEmail || '').toLowerCase().includes(q)
      );
    }

    return {
      data: filteredData.map(row => {
        let messagesArray = [];
        try {
           const parsed = JSON.parse(row.message);
           if (Array.isArray(parsed)) {
             messagesArray = parsed;
           } else {
             messagesArray = [{ sender: 'customer', body: row.message, timestamp: row.createdAt }];
           }
        } catch(e) {
           messagesArray = [{ sender: 'customer', body: row.message, timestamp: row.createdAt }];
        }
        return {
          id: row.id,
          customerId: row.customerName || row.customerEmail,
          customerEmail: row.customerEmail,
          subject: row.subject,
          status: row.status === 'unread' ? 'open' : row.status,
          priority: 'normal',
          messages: messagesArray,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt
        };
      })
    };
  },
  
  get: async (id) => {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  create: async (payload) => {
    const { data, error } = await supabase.from(TABLE).insert([payload]).select();
    if (error) throw error;
    return data[0];
  },

  update: async (id, patch) => {
    const updateData = { updatedAt: new Date().toISOString() };
    if (patch.status) {
      updateData.status = patch.status === 'open' ? 'unread' : patch.status;
    }
    if (patch.messages) {
      updateData.message = JSON.stringify(patch.messages);
    }
    
    const { data, error } = await supabase.from(TABLE).update(updateData).eq('id', id).select();
    if (error) throw error;
    return data[0];
  },

  remove: async (id) => {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
    return { id };
  },
};
