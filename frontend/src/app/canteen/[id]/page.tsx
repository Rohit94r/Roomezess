'use client';

import { useState, useEffect } from 'react';
import { canteenAPI } from '@/lib/api';
import { razorpayAPI } from '@/lib/platformAPI';
import Script from 'next/script';

interface CanteenItem {
  id: string;
  name: string;
  item_name?: string; // Fallback
  description: string;
  price: number;
  category: string; // breakfast, lunch, dinner, etc.
  is_veg: boolean;
  available: boolean;
  image_url?: string;
}

export default function CanteenMenuPage({ params }: { params: { id: string } }) {
  const [items, setItems] = useState<CanteenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ item: CanteenItem, quantity: number }[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [canteenName, setCanteenName] = useState('Canteen');

  useEffect(() => {
    fetchMenu();
  }, [params.id]);

  const fetchMenu = async () => {
    try {
      const response = await canteenAPI.getMenuByCanteen(params.id);
      const data = response.data.data.map((item: any) => ({
        ...item,
        name: item.name || item.item_name, // Handle difference in field names
        category: item.category || 'Lunch'
      }));
      setItems(data);
      // Ideally fetch canteen details too to set name
      if (params.id.includes('atharva')) setCanteenName('Atharva Canteen');
      else if (params.id.includes('bistro')) setCanteenName('Bistro');
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Drinks'];

  const filteredItems = activeCategory === 'All'
    ? items
    : items.filter(item => item.category?.toLowerCase() === activeCategory.toLowerCase());

  const addToCart = (item: CanteenItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.item.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.item.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.item.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.item.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    try {
      const amount = getTotalPrice();
      // 1. Create Order on Razorpay
      const orderData = await razorpayAPI.createOrder(amount, `Order from ${canteenName}`);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Roomezes",
        description: `Order Payment for ${canteenName}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          // 2. Verify Payment & Create Order in DB
          try {
            await razorpayAPI.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            // Create order in DB
            // Note: createOrder needs to be updated to support canteen_id if needed
            // For now we use the generic createOrder or canteenAPI.createOrder
            await canteenAPI.createOrder({
              orderItems: cart.map(c => ({
                item: c.item.id,
                name: c.item.name,
                quantity: c.quantity,
                price: c.item.price
              })),
              totalPrice: amount,
              // canteen_id: params.id // Ensure API supports this
            });

            alert('Payment Successful! Order Placed.');
            setCart([]);
            setShowCart(false);
          } catch (err) {
            console.error(err);
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: "Student Name", // Get from user profile
          email: "student@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#E63946"
        }
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on('payment.failed', function (response: any) {
        alert(response.error.description);
      });
      rzp1.open();

    } catch (error: any) {
      console.error('Error placing order:', error);
      alert('Failed to initiate payment. Please try again.');
    }
  };

  if (loading) {
    return <div className="text-center py-20">Loading menu...</div>;
  }

  return (
    <div className="pb-20 lg:pb-0 bg-gray-50 min-h-screen">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{canteenName} Menu</h1>
            <p className="text-gray-600">Fresh & Hot meals served daily.</p>
          </div>

          <button
            onClick={() => setShowCart(!showCart)}
            className="mt-4 sm:mt-0 relative bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-xl flex items-center shadow-lg transition-transform active:scale-95"
          >
            <span className="font-bold mr-2">View Cart</span>
            <span className="bg-white text-primary-600 px-2 py-0.5 rounded-full text-sm font-bold">
              {cart.reduce((total, item) => total + item.quantity, 0)}
            </span>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto space-x-2 mb-8 pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-semibold transition-all ${activeCategory === cat
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Menu Items */}
          <div className="lg:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredItems.map(item => (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col h-full border border-gray-100">
                  <div className="h-48 rounded-xl overflow-hidden mb-4 bg-gray-100 relative">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-4xl">🥘</div>
                    )}
                    {item.is_veg ? (
                      <div className="absolute top-2 right-2 bg-white/90 p-1 rounded backdrop-blur-sm shadow-sm" title="Veg">
                        <div className="w-4 h-4 border-2 border-green-600 flex items-center justify-center p-0.5">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute top-2 right-2 bg-white/90 p-1 rounded backdrop-blur-sm shadow-sm" title="Non-Veg">
                        <div className="w-4 h-4 border-2 border-red-600 flex items-center justify-center p-0.5">
                          <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{item.description}</p>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">₹{item.price}</span>
                    <button
                      onClick={() => addToCart(item)}
                      className="px-4 py-2 bg-gray-100 hover:bg-primary-600 hover:text-white text-gray-700 rounded-lg font-semibold transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {filteredItems.length === 0 && (
              <p className="text-center text-gray-500 py-12">No items found in this category.</p>
            )}
          </div>

          {/* Cart Sidebar */}
          {showCart && (
            <div className="fixed inset-0 z-50 lg:static lg:z-auto lg:h-auto lg:w-1/3">
              <div className="absolute inset-0 bg-black/50 lg:hidden" onClick={() => setShowCart(false)}></div>
              <div className="absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-white lg:rounded-3xl shadow-2xl lg:shadow-lg p-6 flex flex-col">
                {/* Cart Content (Simplified for brevity) */}
                <h2 className="text-2xl font-bold mb-6">Your Order</h2>
                <div className="flex-1 overflow-y-auto space-y-4">
                  {cart.map(c => (
                    <div key={c.item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                      <div className="flex-1">
                        <p className="font-semibold">{c.item.name}</p>
                        <p className="text-sm text-gray-500">₹{c.item.price} x {c.quantity}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => updateQuantity(c.item.id, c.quantity - 1)} className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center">-</button>
                        <span>{c.quantity}</span>
                        <button onClick={() => updateQuantity(c.item.id, c.quantity + 1)} className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center">+</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between text-xl font-bold mb-4">
                    <span>Total</span>
                    <span className="text-primary-600">₹{getTotalPrice()}</span>
                  </div>
                  <button
                    onClick={handlePlaceOrder}
                    className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-primary-700 transition-colors"
                  >
                    Pay with Razorpay
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}