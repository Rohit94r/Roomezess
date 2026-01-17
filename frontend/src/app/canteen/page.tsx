'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface CanteenItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  is_veg: boolean;
  meal_type: string;
  is_special: boolean;
  available: boolean;
  image_url?: string;
  preparation_time?: number;
  spice_level?: string;
  calories?: number;
  category?: string;
}

interface CartItem extends CanteenItem {
  quantity: number;
}

export default function CanteenPage() {
  const [selectedCanteen, setSelectedCanteen] = useState('Atharva Canteen');
  const [selectedMeal, setSelectedMeal] = useState('all');
  const [items, setItems] = useState<CanteenItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
    loadItems();
  }, [selectedCanteen, selectedMeal]);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadItems = async () => {
    setLoading(true);
    const { data: canteen } = await supabase
      .from('canteens')
      .select('id')
      .eq('name', selectedCanteen)
      .single();

    if (canteen) {
      let query = supabase
        .from('canteen_items')
        .select('*')
        .eq('canteen_id', canteen.id)
        .eq('available', true);

      // If not 'all', filter by meal type
      if (selectedMeal !== 'all') {
        query = query.eq('meal_type', selectedMeal);
      }

      const { data } = await query;
      setItems(data || []);
    }
    setLoading(false);
  };

  const addToCart = (item: CanteenItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const proceedToPay = async () => {
    if (!user) {
      alert('Please login to place order');
      return;
    }

    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    try {
      // Create Razorpay order
      const orderResponse = await fetch('/api/razorpay/create-canteen-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: getTotalPrice(),
          receipt: `canteen_${Date.now()}`
        })
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order');
      }

      const orderData = await orderResponse.json();

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => initializeRazorpay(orderData);
        document.head.appendChild(script);
      } else {
        initializeRazorpay(orderData);
      }

    } catch (error) {
      console.error('Payment initialization failed:', error);
      alert('Payment failed to initialize. Please try again.');
    }
  };

  const initializeRazorpay = (orderData: any) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'Roomezes Canteen',
      description: `Order from ${selectedCanteen}`,
      order_id: orderData.id,
      handler: async (response: any) => {
        try {
          // Payment successful, create order
          const { data: canteen } = await supabase
            .from('canteens')
            .select('id')
            .eq('name', selectedCanteen)
            .single();

          const orderResponse = await fetch('/api/canteen/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: user.id,
              canteen_id: canteen?.id,
              items: cart,
              total_price: getTotalPrice(),
              payment_id: response.razorpay_payment_id
            })
          });

          if (orderResponse.ok) {
            setCart([]);
            alert('🎉 Order placed successfully! WhatsApp notification sent to canteen. You will receive confirmation shortly.');
          } else {
            throw new Error('Failed to create order');
          }
        } catch (error) {
          console.error('Order creation failed:', error);
          alert('Payment successful but order creation failed. Please contact support.');
        }
      },
      prefill: {
        email: user.email,
        name: user.user_metadata?.name || user.email,
      },
      theme: {
        color: '#E53935'
      },
      modal: {
        ondismiss: () => {
          console.log('Payment cancelled by user');
        }
      }
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  };

  const specialItems = items.filter(item => item.is_special);
  const regularItems = items.filter(item => !item.is_special && item.available);

  const getSpiceLevelEmoji = (level?: string) => {
    switch (level) {
      case 'mild': return '🟢';
      case 'medium': return '🟡';
      case 'spicy': return '🟠';
      case 'very_spicy': return '🔴';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-red-600 text-white p-6">
        <h1 className="text-2xl font-bold">Atharva Campus Canteens</h1>
        <p className="text-red-100">Order food before break, skip the queue</p>
      </div>

      {/* Canteen Tabs */}
      <div className="p-4">
        <div className="flex gap-2 mb-6">
          {['Atharva Canteen', 'Bistro Canteen'].map(canteen => (
            <button
              key={canteen}
              onClick={() => setSelectedCanteen(canteen)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold ${
                selectedCanteen === canteen
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 border'
              }`}
            >
              {canteen}
            </button>
          ))}
        </div>

        {/* Today's Special */}
        {specialItems.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3">🔥 Today's Special</h2>
            {specialItems.map(item => (
              <div key={item.id} className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xl font-bold text-red-600">₹{item.price}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        item.is_veg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.is_veg ? '🟢 Veg' : '🔴 Non-Veg'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Meal Type Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {['all', 'breakfast', 'lunch', 'dinner'].map(meal => (
            <button
              key={meal}
              onClick={() => setSelectedMeal(meal)}
              className={`px-4 py-2 rounded-lg font-semibold capitalize whitespace-nowrap ${
                selectedMeal === meal
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 border'
              }`}
            >
              {meal === 'all' ? 'All Items' : meal}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading delicious menu...</p>
          </div>
        ) : (
          <div className="grid gap-4 mb-20">
            {regularItems.map(item => (
              <div key={item.id} className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      {item.spice_level && (
                        <span className="text-lg">{getSpiceLevelEmoji(item.spice_level)}</span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        item.is_veg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.is_veg ? '🟢 Veg' : '🔴 Non-Veg'}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="text-xl font-bold text-red-600">₹{item.price}</span>
                      {item.preparation_time && (
                        <span className="flex items-center gap-1">
                          ⏱️ {item.preparation_time}min
                        </span>
                      )}
                      {item.calories && (
                        <span className="flex items-center gap-1">
                          🔥 {item.calories} cal
                        </span>
                      )}
                      <span className="bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-md hover:shadow-lg ml-4"
                  >
                    + Add
                  </button>
                </div>
              </div>
            ))}
            {regularItems.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-gray-600 text-lg">
                  {selectedMeal === 'all' ? 'No items available' : `No items available for ${selectedMeal}`}
                </p>
                <p className="text-gray-500 text-sm">
                  {selectedMeal === 'all' ? 'Check back later for menu updates' : 'Try switching to a different meal time'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky Cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <div className="max-w-md mx-auto">
            <div className="mb-3">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center py-1">
                  <span className="text-sm">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 bg-gray-200 rounded-full text-sm"
                    >
                      -
                    </button>
                    <span className="text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 bg-gray-200 rounded-full text-sm"
                    >
                      +
                    </button>
                    <span className="text-sm font-semibold">₹{item.price * item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">Total: ₹{getTotalPrice()}</span>
              <button
                onClick={proceedToPay}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700"
              >
                Proceed to Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}