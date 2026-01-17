import { supabase } from './supabaseClient';

// ====================================================
// MODULE 1: PRINTING API
// ====================================================

export const printingAPI = {
  // Get single printing shop
  getShop: async () => {
    const { data, error } = await supabase
      .from('printing_shop')
      .select('*')
      .eq('available', true)
      .single();
    if (error) throw error;
    return { data, error };
  },

  // Create printing order
  createOrder: async (orderData: any) => {
    const { data, error } = await supabase
      .from('printing_orders')
      .insert([orderData])
      .select();
    if (error) throw error;
    return { data: data?.[0], error };
  },

  // Get user's printing orders
  getUserOrders: async (userId: string) => {
    const { data, error } = await supabase
      .from('printing_orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { data, error };
  },

  // Get all printing orders (admin)
  getAllOrders: async () => {
    const { data, error } = await supabase
      .from('printing_orders')
      .select('*, profiles:user_id(email, name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { data, error };
  },

  // Update order status (admin)
  updateOrderStatus: async (orderId: string, status: string) => {
    const { data, error } = await supabase
      .from('printing_orders')
      .update({ status })
      .eq('id', orderId)
      .select();
    if (error) throw error;
    return { data: data?.[0], error };
  },
};

// ====================================================
// MODULE 2: LAUNDRY API
// ====================================================

export const laundryAPI = {
  // Get all laundry shops
  getShops: async () => {
    const { data, error } = await supabase
      .from('laundry_shops')
      .select('*')
      .eq('available', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { data, error };
  },

  // Get single shop details
  getShop: async (shopId: string) => {
    const { data, error } = await supabase
      .from('laundry_shops')
      .select('*')
      .eq('id', shopId)
      .single();
    if (error) throw error;
    return { data, error };
  },

  // Create laundry order
  createOrder: async (orderData: any) => {
    const { data, error } = await supabase
      .from('laundry_orders')
      .insert([orderData])
      .select();
    if (error) throw error;
    return { data: data?.[0], error };
  },

  // Get user's laundry orders
  getUserOrders: async (userId: string) => {
    const { data, error } = await supabase
      .from('laundry_orders')
      .select('*, laundry_shops(name, phone, image_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { data, error };
  },

  // Get shop orders (owner)
  getShopOrders: async (shopId: string) => {
    const { data, error } = await supabase
      .from('laundry_orders')
      .select('*, profiles:user_id(email, name)')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { data, error };
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: string) => {
    const { data, error } = await supabase
      .from('laundry_orders')
      .update({ status })
      .eq('id', orderId)
      .select();
    if (error) throw error;
    return { data: data?.[0], error };
  },

  // Admin: Create shop
  createShop: async (shopData: any) => {
    const { data, error } = await supabase
      .from('laundry_shops')
      .insert([shopData])
      .select();
    if (error) throw error;
    return { data: data?.[0], error };
  },

  // Admin: Get all shops
  getAllShops: async () => {
    const { data, error } = await supabase
      .from('laundry_shops')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { data, error };
  },

  // Admin: Update shop
  updateShop: async (shopId: string, shopData: any) => {
    const { data, error } = await supabase
      .from('laundry_shops')
      .update(shopData)
      .eq('id', shopId)
      .select();
    if (error) throw error;
    return { data: data?.[0], error };
  },
};

// ====================================================
// MODULE 3: MESS API
// ====================================================

export const messAPI = {
  // Get all mess shops
  getShops: async () => {
    const { data, error } = await supabase
      .from('mess_shops')
      .select('*')
      .eq('available', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { data, error };
  },

  // Get single mess details
  getShop: async (messId: string) => {
    const { data, error } = await supabase
      .from('mess_shops')
      .select('*')
      .eq('id', messId)
      .single();
    if (error) throw error;
    return { data, error };
  },

  // Subscribe to mess
  subscribe: async (subscriptionData: any) => {
    const { data, error } = await supabase
      .from('mess_subscriptions')
      .insert([subscriptionData])
      .select();
    if (error) throw error;
    return { data: data?.[0], error };
  },

  // Get user subscriptions
  getUserSubscriptions: async (userId: string) => {
    const { data, error } = await supabase
      .from('mess_subscriptions')
      .select('*, mess_shops(name, image_url, phone)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { data, error };
  },

  // Admin: Create mess
  createShop: async (messData: any) => {
    const { data, error } = await supabase
      .from('mess_shops')
      .insert([messData])
      .select();
    if (error) throw error;
    return { data: data?.[0], error };
  },

  // Admin: Get all messes
  getAllShops: async () => {
    const { data, error } = await supabase
      .from('mess_shops')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { data, error };
  },
};

// ====================================================
// MODULE 4: CANTEEN API
// ====================================================

export const canteenAPI = {
  // Get menu items
  getMenu: async (category?: string) => {
    let query = supabase
      .from('canteen_menu')
      .select('*')
      .eq('available', true);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('item_name');
    if (error) throw error;
    return { data, error };
  },

  // Get menu by category
  getByCategory: async () => {
    const { data, error } = await supabase
      .from('canteen_menu')
      .select('*')
      .eq('available', true)
      .order('category, item_name');
    if (error) throw error;
    return { data, error };
  },

  // Create canteen order
  createOrder: async (orderData: any) => {
    const { data, error } = await supabase
      .from('canteen_orders')
      .insert([orderData])
      .select();
    if (error) throw error;
    return { data: data?.[0], error };
  },

  // Get user's canteen orders
  getUserOrders: async (userId: string) => {
    const { data, error } = await supabase
      .from('canteen_orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { data, error };
  },

  // Get all canteen orders (admin)
  getAllOrders: async () => {
    const { data, error } = await supabase
      .from('canteen_orders')
      .select('*, profiles:user_id(email, name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { data, error };
  },

  // Update order status (admin)
  updateOrderStatus: async (orderId: string, status: string) => {
    const { data, error } = await supabase
      .from('canteen_orders')
      .update({ order_status: status })
      .eq('id', orderId)
      .select();
    if (error) throw error;
    return { data: data?.[0], error };
  },

  // Admin: Add menu item
  addMenuItem: async (itemData: any) => {
    const { data, error } = await supabase
      .from('canteen_menu')
      .insert([itemData])
      .select();
    if (error) throw error;
    return { data: data?.[0], error };
  },

  // Admin: Get all menu items
  getAllMenuItems: async () => {
    const { data, error } = await supabase
      .from('canteen_menu')
      .select('*')
      .order('category, item_name');
    if (error) throw error;
    return { data, error };
  },

  // Admin: Update menu item
  updateMenuItem: async (itemId: string, itemData: any) => {
    const { data, error } = await supabase
      .from('canteen_menu')
      .update(itemData)
      .eq('id', itemId)
      .select();
    if (error) throw error;
    return { data: data?.[0], error };
  },

  // Get all canteens (shops)
  getAllCanteens: async () => {
    const { data, error } = await supabase
      .from('canteens')
      .select('*')
      .order('name');
    if (error) throw error;
    return { data, error };
  },
};

// ====================================================
// RAZORPAY INTEGRATION HELPERS
// ====================================================

export const razorpayAPI = {
  // Create order on Razorpay
  createOrder: async (amount: number, description: string) => {
    try {
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, description }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create order');
      return data;
    } catch (error) {
      console.error('Razorpay order error:', error);
      throw error;
    }
  },

  // Verify payment
  verifyPayment: async (razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) => {
    try {
      const response = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Payment verification failed');
      return data;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  },
};
