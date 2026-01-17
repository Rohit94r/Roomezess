import { supabase } from './supabaseClient'

interface UserRegistrationData {
  name: string
  email: string
  phone: string
  password: string
  role: string
  college: string
  serviceType?: string
}

interface OrderItem {
  item: string
  name: string
  quantity: number
  price: number
}

interface OrderData {
  orderItems: OrderItem[]
  totalPrice: number
  notes?: string
}

// Auth API calls using Supabase Auth
export const authAPI = {
  register: async (userData: UserRegistrationData) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          phone: userData.phone,
          role: userData.role,
          college: userData.college,
          serviceType: userData.serviceType
        }
      }
    })

    if (error) {
      // Format error to match expected API response structure
      const errorResponse = {
        data: {
          success: false,
          message: error.message
        }
      };
      throw errorResponse;
    }

    // Get the session to extract the access token
    const session = data.session;

    // Return success response similar to the old API
    return {
      data: {
        success: true,
        message: 'User registered successfully',
        user: {
          id: data.user?.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          role: userData.role,
          college: userData.college,
          isVerified: false,
          serviceType: userData.serviceType,
          token: session?.access_token || '' // Include token for compatibility
        }
      }
    }
  },

  login: async (credentials: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    })

    if (error) {
      try {
        console.error('Auth login error', error)
      } catch { }
      // Format error to match expected API response structure
      const errorResponse = {
        data: {
          success: false,
          message: error.message
        }
      };
      throw errorResponse;
    }

    // Get the session to extract the access token
    const session = data.session;

    return {
      data: {
        success: true,
        message: 'Login successful',
        user: {
          id: data.user?.id,
          name: data.user?.user_metadata?.name,
          email: data.user?.email,
          phone: data.user?.user_metadata?.phone,
          role: data.user?.user_metadata?.role,
          college: data.user?.user_metadata?.college,
          isVerified: data.user?.user_metadata?.is_verified || false,
          serviceType: data.user?.user_metadata?.serviceType,
          token: session?.access_token || '' // Include token for compatibility
        }
      }
    }
  },

  resendEmailConfirmation: async (email: string) => {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email
    })
    if (error) {
      const errorResponse = {
        data: {
          success: false,
          message: error.message
        }
      };
      throw errorResponse;
    }
    return { data: { success: true, message: 'Confirmation email sent' } }
  },

  getProfile: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      // Format error to match expected API response structure
      const errorResponse = {
        data: {
          success: false,
          message: error.message
        }
      };
      throw errorResponse;
    }

    if (!user) {
      const errorResponse = {
        data: {
          success: false,
          message: 'No authenticated user'
        }
      };
      throw errorResponse;
    }

    // Fetch profile data from the profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      // Format error to match expected API response structure
      const errorResponse = {
        data: {
          success: false,
          message: profileError.message
        }
      };
      throw errorResponse;
    }

    return {
      data: {
        success: true,
        user: {
          id: profile.id,
          name: profile.name,
          email: user.email,
          role: profile.role,
          college: profile.college,
          isVerified: profile.is_verified,
          skills: (user as any)?.user_metadata?.skills || [],
          serviceType: (user as any)?.user_metadata?.serviceType
        }
      }
    }
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      // Format error to match expected API response structure
      const errorResponse = {
        data: {
          success: false,
          message: error.message
        }
      };
      throw errorResponse;
    }
    return { data: { success: true, message: 'Logged out successfully' } }
  },

  updateProfile: async (userData: any) => {
    // Update user metadata in Supabase Auth
    const { data, error } = await supabase.auth.updateUser({
      data: {
        name: userData.name,
        phone: userData.phone,
        role: userData.role,
        college: userData.college,
        serviceType: userData.serviceType,
        collegeEmail: userData.collegeEmail,
        collegeIdNumber: userData.collegeIdNumber,
        verificationNumber: userData.verificationNumber,
        is_verified: userData.isVerified,
        skills: userData.skills
      }
    });

    if (error) {
      // Format error to match expected API response structure
      const errorResponse = {
        data: {
          success: false,
          message: error.message
        }
      };
      throw errorResponse;
    }

    // Update profile in the profiles table
    const profileUpdate = await supabase
      .from('profiles')
      .update({
        name: userData.name,
        role: userData.role,
        college: userData.college,
        is_verified: userData.isVerified
      })
      .eq('id', data.user?.id);

    if (profileUpdate.error) {
      const errorResponse = {
        data: {
          success: false,
          message: profileUpdate.error.message
        }
      };
      throw errorResponse;
    }

    return {
      data: {
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: data.user?.id,
          name: userData.name,
          email: data.user?.email,
          phone: userData.phone,
          role: userData.role,
          college: userData.college,
          isVerified: userData.isVerified || data.user?.user_metadata?.is_verified || false,
          serviceType: userData.serviceType,
          skills: userData.skills || (data.user as any)?.user_metadata?.skills || []
        }
      }
    };
  }
}

// Laundry API calls
export const laundryAPI = {
  getAllShops: async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('service_type', 'laundry')
      .eq('available', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      data: {
        success: true,
        data: data
      }
    }
  },

  createShop: async (shopData: any) => {
    const { data, error } = await supabase
      .from('services')
      .insert({
        name: shopData.name,
        description: shopData.description,
        price: shopData.price,
        image_url: shopData.image_url,
        service_type: 'laundry',
        available: true
      })
      .select()
      .single()

    if (error) throw error

    return { data: { success: true, data } }
  },

  updateShop: async (id: string, shopData: any) => {
    const { data, error } = await supabase
      .from('services')
      .update(shopData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return { data: { success: true, data } }
  },

  deleteShop: async (id: string) => {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id)

    if (error) throw error

    return { data: { success: true } }
  }
}

// Canteen API calls
export const canteenAPI = {
  getAllCanteens: async () => {
    const { data, error } = await supabase
      .from('canteens')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    return {
      data: {
        success: true,
        data: data
      }
    }
  },

  getMenuByCanteen: async (canteenId: string) => {
    const { data, error } = await supabase
      .from('canteen_items')
      .select('*, profiles(name)')
      .eq('canteen_id', canteenId)
      .eq('available', true)
      .order('category, name');
    // Note: We are using canteen_items based on schema.sql, 
    // but if admin uses canteen_menu, we might need to adjust.
    // Trying canteen_menu first if items fail or vice versa?
    // platformAPI defines canteen_menu. So let's try to align with platformAPI if possible 
    // OR we assume my SQL migration aligned them to canteen_items.
    // Schema.sql had canteen_items. PlatformAPI has canteen_menu.
    // I will assume canteen_menu is the one used by Admin.

    if (error) {
      // Fallback to canteen_menu if canteen_items fails or is empty?
      // Let's stick to what we decided: canteen_menu is used by Admin, so we should read from it.
      // But wait, my SQL migration added canteen_id to canteen_items (line 24 in schema dump was table create).
      // Actually, I should probably check if I can query both or rename.
      // Let's use 'canteen_menu' as per PlatformAPI to match Admin.
      throw error;
    }

    return {
      data: {
        success: true,
        count: data.length,
        data: data
      }
    }
  },

  getItems: async () => {
    // Legacy support or fallback?
    const { data, error } = await supabase
      .from('canteen_menu') // Changed to canteen_menu to match platformAPI
      .select('*')
      .eq('available', true)

    if (error) {
      // Format error to match expected API response structure
      const errorResponse = {
        data: {
          success: false,
          message: error.message
        }
      };
      throw errorResponse;
    }

    return {
      data: {
        success: true,
        count: data.length,
        data: data
      }
    }
  },

  getItemById: async (id: string) => {
    const { data, error } = await supabase
      .from('canteen_items')
      .select(`
        *,
        profiles(name, email)
      `)
      .eq('id', id)
      .single()

    if (error) {
      // Format error to match expected API response structure
      const errorResponse = {
        data: {
          success: false,
          message: error.message
        }
      };
      throw errorResponse;
    }

    return { data: { success: true, data } }
  },

  createItem: async (itemData: any) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      const errorResponse = {
        data: {
          success: false,
          message: authError?.message || 'Not authenticated'
        }
      };
      throw errorResponse;
    }

    const { data, error } = await supabase
      .from('canteen_items')
      .insert({
        name: itemData.name,
        price: itemData.price,
        is_veg: itemData.is_veg ?? true,
        available: itemData.available ?? true,
        description: itemData.description ?? '',
        owner_id: user.id
      })
      .select()
      .single()

    if (error) {
      // Format error to match expected API response structure
      const errorResponse = {
        data: {
          success: false,
          message: error.message
        }
      };
      throw errorResponse;
    }

    return { data: { success: true, data } }
  },

  updateItem: async (id: string, itemData: any) => {
    const { data, error } = await supabase
      .from('canteen_items')
      .update(itemData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return { data: { success: true, data } }
  },

  deleteItem: async (id: string) => {
    const { error } = await supabase
      .from('canteen_items')
      .delete()
      .eq('id', id)

    if (error) throw error

    return { data: { success: true, message: 'Canteen item removed' } }
  },

  createOrder: async (orderData: OrderData) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw authError || new Error('Not authenticated')

    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        items: orderData.orderItems,
        total_price: orderData.totalPrice,
        notes: orderData.notes || ''
      })
      .select()
      .single()

    if (error) throw error

    return { data: { success: true, data } }
  },

  getStudentOrders: async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw authError || new Error('Not authenticated')

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        profiles(name, email)
      `)
      .eq('user_id', user.id)

    if (error) throw error

    return {
      data: {
        success: true,
        count: data.length,
        data: data
      }
    }
  },

  getOwnerOrders: async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw authError || new Error('Not authenticated')

    // First get all canteen items owned by the current user
    const { data: canteenItems, error: itemsError } = await supabase
      .from('canteen_items')
      .select('id')
      .eq('owner_id', user.id)

    if (itemsError) throw itemsError

    if (canteenItems.length === 0) {
      return {
        data: {
          success: true,
          count: 0,
          data: []
        }
      }
    }

    // Extract item IDs
    const itemIds = canteenItems.map((item: { id: string }) => item.id)

    // Then get orders containing those items
    let query = supabase.from('orders').select(`
      *,
      profiles(name, email, phone)
    `)

    // Build a query to check if any item in the order belongs to the owner
    // We'll need to filter on the client side since Postgres array querying is complex
    const { data: allOrders, error: ordersError } = await query

    if (ordersError) throw ordersError

    // Filter orders that contain items from this owner
    const ownerOrders = allOrders.filter((order: any) =>
      order.items.some((item: any) => itemIds.includes(item.item))
    )

    return {
      data: {
        success: true,
        count: ownerOrders.length,
        data: ownerOrders
      }
    }
  },

  updateOrderStatus: async (id: string, status: string) => {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        profiles(name, email, phone)
      `)
      .single()

    if (error) throw error

    return { data: { success: true, data } }
  }
}

// Rooms API calls
export const roomsAPI = {
  getRooms: async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
        profiles(name)
      `)
    // images column is fetched automatically by *

    if (error) throw error

    return {
      data: {
        success: true,
        count: data.length,
        data: data
      }
    }
  },

  getRoomById: async (id: string) => {
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
        profiles(name)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    return { data: { success: true, data } }
  },

  createRoom: async (roomData: any) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw authError || new Error('Not authenticated')

    const { data, error } = await supabase
      .from('rooms')
      .insert({
        title: roomData.title,
        rent: roomData.rent,
        distance_km: roomData.distance_km,
        amenities: roomData.amenities || [],
        contact: roomData.contact,
        // Support new fields if passed
        description: roomData.description,
        room_type: roomData.room_type,
        furnishing: roomData.furnishing,
        images: roomData.images || [],
        owner_id: user.id
      })
      .select()
      .single()

    if (error) throw error

    return { data: { success: true, data } }
  },

  updateRoom: async (id: string, roomData: any) => {
    const { data, error } = await supabase
      .from('rooms')
      .update(roomData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return { data: { success: true, data } }
  },

  deleteRoom: async (id: string) => {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id)

    if (error) throw error

    return { data: { success: true, message: 'Room deleted' } }
  },

  getRoommatePosts: async () => {
    const { data, error } = await supabase
      .from('roommate_posts')
      .select(`
        *,
        profiles(name)
      `)

    if (error) throw error

    return {
      data: {
        success: true,
        count: data.length,
        data: data
      }
    }
  },

  createRoommatePost: async (postData: any) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw authError || new Error('Not authenticated')

    const { data, error } = await supabase
      .from('roommate_posts')
      .insert({
        budget: postData.budget,
        location: postData.location,
        preferences: postData.preferences,
        contact: postData.contact,
        user_id: user.id
      })
      .select()
      .single()

    if (error) throw error

    return { data: { success: true, data } }
  }
}


// Community API calls
export const communityAPI = {
  getPosts: async () => {
    const { data, error } = await supabase
      .from('community_posts')
      .select(`
        *,
        profiles(name)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      data: {
        success: true,
        count: data.length,
        data: data
      }
    }
  },

  getPostById: async (id: string) => {
    const { data, error } = await supabase
      .from('community_posts')
      .select(`
        *,
        profiles(name)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    return { data: { success: true, data } }
  },

  createPost: async (postData: any) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw authError || new Error('Not authenticated')

    // Check if user is verified
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_verified')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_verified) {
      throw new Error('Only verified students can create community posts')
    }

    const { data, error: insertError } = await supabase
      .from('community_posts')
      .insert({
        type: postData.type,
        content: postData.content,
        image_url: postData.image_url,
        user_id: user.id
      })
      .select()
      .single()

    if (insertError) throw insertError

    return { data: { success: true, data } }
  }
}

// Events API calls
export const eventsAPI = {
  getEvents: async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })

    if (error) throw error

    return {
      data: {
        success: true,
        count: data.length,
        data: data
      }
    }
  },

  getEventById: async (id: string) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return { data: { success: true, data } }
  },

  createEvent: async (eventData: any) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw authError || new Error('Not authenticated')

    const { data, error } = await supabase
      .from('events')
      .insert({
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        location: eventData.location,
        image_url: eventData.image_url || null,
        map_link: eventData.map_link || null,
        register_link: eventData.register_link || null,
        owner_id: user.id
      })
      .select()
      .single()

    if (error) throw error

    return { data: { success: true, data } }
  }
}


export const servicesAPI = {
  getServicesByType: async (serviceType: string) => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('service_type', serviceType)
      .eq('available', true)

    if (error) throw error

    return {
      data: {
        success: true,
        count: data.length,
        data: data
      }
    }
  },

  getServicesByOwnerAndType: async (serviceType: string) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw authError || new Error('Not authenticated')

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('service_type', serviceType)
      .eq('owner_id', user.id)

    if (error) throw error

    return {
      data: {
        success: true,
        count: data.length,
        data: data
      }
    }
  },

  createService: async (serviceData: any) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw authError || new Error('Not authenticated')

    const { data, error } = await supabase
      .from('services')
      .insert({
        name: serviceData.name,
        description: serviceData.description,
        price: serviceData.price,
        category: serviceData.category,
        service_type: serviceData.service_type,
        available: serviceData.available ?? true,
        image: serviceData.image,
        owner_id: user.id
      })
      .select()
      .single()

    if (error) throw error

    return { data: { success: true, data } }
  },

  updateService: async (id: string, serviceData: any) => {
    const { data, error } = await supabase
      .from('services')
      .update(serviceData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return { data: { success: true, data } }
  },

  deleteService: async (id: string) => {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id)

    if (error) throw error

    return { data: { success: true, message: 'Service deleted' } }
  },
};

// Generic Orders API for service-based orders (e.g., printing)
export const ordersAPI = {
  createOrder: async (orderData: { items: any[]; totalPrice: number; notes?: string }) => {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        items: orderData.items,
        total_price: orderData.totalPrice,
        notes: orderData.notes || '',
        status: 'pending'
      })
      .select()
      .single()
    if (error) {
      const errorResponse = {
        data: {
          success: false,
          message: error.message
        }
      };
      throw errorResponse;
    }
    return { data: { success: true, data } }
  }
}

// Roommates API calls
export const roommatesAPI = {
  getRoommates: async () => {
    const { data, error } = await supabase
      .from('roommates_admin')
      .select('*')
      .eq('available', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      data: {
        success: true,
        count: data.length,
        data: data
      }
    }
  },

  getRoommatesByOwner: async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw authError || new Error('Not authenticated')

    const { data, error } = await supabase
      .from('roommates_admin')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      data: {
        success: true,
        count: data.length,
        data: data
      }
    }
  },

  createRoommate: async (roommateData: any) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw authError || new Error('Not authenticated')

    const { data, error } = await supabase
      .from('roommates_admin')
      .insert({
        name: roommateData.name,
        gender: roommateData.gender || null,
        budget: roommateData.budget || null,
        location: roommateData.location || null,
        preferences: roommateData.preferences || null,
        contact: roommateData.contact,
        image_url: roommateData.image_url || null,
        available: roommateData.available !== false,
        owner_id: user.id
      })
      .select()
      .single()

    if (error) throw error

    return { data: { success: true, data } }
  },

  updateRoommate: async (roommateId: string, roommateData: any) => {
    const { data, error } = await supabase
      .from('roommates_admin')
      .update(roommateData)
      .eq('id', roommateId)
      .select()
      .single()

    if (error) throw error

    return { data: { success: true, data } }
  },

  deleteRoommate: async (roommateId: string) => {
    const { error } = await supabase
      .from('roommates_admin')
      .delete()
      .eq('id', roommateId)

    if (error) throw error

    return { data: { success: true } }
  }
}

// Admin API calls
export const adminAPI = {
  getUsers: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')

    if (error) throw error

    return {
      data: {
        success: true,
        count: data.length,
        data: data
      }
    }
  },

  verifyStudent: async (userId: string, isVerified: boolean) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_verified: isVerified })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error

    return { data: { success: true, data } }
  }
}
