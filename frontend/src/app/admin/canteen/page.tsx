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
  category?: string;
  preparation_time?: number;
  spice_level?: string;
  calories?: number;
  is_special: boolean;
  available: boolean;
  canteen_id: string;
  display_order?: number;
}

interface Order {
  id: string;
  items: any[];
  total_price: number;
  status: string;
  created_at: string;
  user_id: string;
  estimated_time?: number;
  customer_notes?: string;
}

interface Inventory {
  id: string;
  item_id: string;
  stock_quantity: number;
  low_stock_threshold: number;
  last_updated: string;
}

export default function AdminCanteenPage() {
  const [activeTab, setActiveTab] = useState<'menu' | 'orders' | 'inventory' | 'analytics'>('menu');
  const [selectedCanteen, setSelectedCanteen] = useState('Atharva Canteen');
  const [selectedMealType, setSelectedMealType] = useState('all');
  const [items, setItems] = useState<CanteenItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [canteens, setCanteens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingItem, setEditingItem] = useState<CanteenItem | null>(null);

  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    is_veg: true,
    meal_type: 'breakfast',
    category: 'main',
    preparation_time: '15',
    spice_level: 'mild',
    calories: '',
    is_special: false,
    available: true,
    display_order: '0'
  });

  useEffect(() => {
    loadCanteens();
  }, []);

  useEffect(() => {
    if (canteens.length > 0) {
      loadItems();
      loadOrders();
      loadInventory();
    }
  }, [selectedCanteen, selectedMealType, canteens]);

  const loadCanteens = async () => {
    const { data } = await supabase.from('canteens').select('*').order('name');
    setCanteens(data || []);
  };

  const loadItems = async () => {
    setLoading(true);
    const canteen = canteens.find(c => c.name === selectedCanteen);
    if (canteen) {
      let query = supabase
        .from('canteen_items')
        .select('*')
        .eq('canteen_id', canteen.id)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });
      
      if (selectedMealType !== 'all') {
        query = query.eq('meal_type', selectedMealType);
      }
      
      const { data } = await query;
      setItems(data || []);
    }
    setLoading(false);
  };

  const loadOrders = async () => {
    const canteen = canteens.find(c => c.name === selectedCanteen);
    if (canteen) {
      const { data } = await supabase
        .from('canteen_orders')
        .select('*')
        .eq('canteen_id', canteen.id)
        .order('created_at', { ascending: false })
        .limit(50);
      setOrders(data || []);
    }
  };

  const loadInventory = async () => {
    const canteen = canteens.find(c => c.name === selectedCanteen);
    if (canteen) {
      const { data } = await supabase
        .from('canteen_inventory')
        .select(`
          *,
          canteen_items!inner(name, price)
        `)
        .eq('canteen_id', canteen.id);
      setInventory(data || []);
    }
  };

  const addOrUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const canteen = canteens.find(c => c.name === selectedCanteen);
    if (!canteen) return;

    try {
      const itemData = {
        name: newItem.name,
        description: newItem.description,
        price: parseFloat(newItem.price),
        is_veg: newItem.is_veg,
        meal_type: newItem.meal_type,
        category: newItem.category,
        preparation_time: parseInt(newItem.preparation_time),
        spice_level: newItem.spice_level,
        calories: newItem.calories ? parseInt(newItem.calories) : null,
        is_special: newItem.is_special,
        available: newItem.available,
        display_order: parseInt(newItem.display_order),
        canteen_id: canteen.id
      };

      if (editingItem) {
        const { error } = await supabase
          .from('canteen_items')
          .update(itemData)
          .eq('id', editingItem.id);
        if (error) throw error;
        setMessage('Item updated successfully!');
        setEditingItem(null);
      } else {
        const { error, data } = await supabase
          .from('canteen_items')
          .insert(itemData)
          .select()
          .single();
        if (error) throw error;
        
        // Add to inventory
        await supabase.from('canteen_inventory').insert({
          canteen_id: canteen.id,
          item_id: data.id,
          stock_quantity: 50,
          low_stock_threshold: 10
        });
        
        setMessage('Item added successfully!');
      }

      resetForm();
      loadItems();
      loadInventory();
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  const resetForm = () => {
    setNewItem({
      name: '',
      description: '',
      price: '',
      is_veg: true,
      meal_type: 'breakfast',
      category: 'main',
      preparation_time: '15',
      spice_level: 'mild',
      calories: '',
      is_special: false,
      available: true,
      display_order: '0'
    });
  };

  const editItem = (item: CanteenItem) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      is_veg: item.is_veg,
      meal_type: item.meal_type,
      category: item.category || 'main',
      preparation_time: (item.preparation_time || 15).toString(),
      spice_level: item.spice_level || 'mild',
      calories: item.calories?.toString() || '',
      is_special: item.is_special,
      available: item.available,
      display_order: (item.display_order || 0).toString()
    });
  };

  const toggleAvailability = async (id: string, available: boolean) => {
    await supabase
      .from('canteen_items')
      .update({ available: !available })
      .eq('id', id);
    loadItems();
  };

  const toggleSpecial = async (id: string, is_special: boolean) => {
    const canteen = canteens.find(c => c.name === selectedCanteen);
    if (!canteen) return;

    if (!is_special) {
      // Remove all specials first
      await supabase
        .from('canteen_items')
        .update({ is_special: false })
        .eq('canteen_id', canteen.id);
      
      // Set this item as special
      await supabase
        .from('canteen_items')
        .update({ is_special: true })
        .eq('id', id);
        
      // Add to daily specials
      await supabase
        .from('daily_specials')
        .upsert({
          canteen_id: canteen.id,
          item_id: id,
          special_date: new Date().toISOString().split('T')[0],
          is_active: true
        });
    } else {
      await supabase
        .from('canteen_items')
        .update({ is_special: false })
        .eq('id', id);
    }
    loadItems();
  };

  const deleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this item? This will also remove it from inventory.')) {
      await supabase.from('canteen_items').delete().eq('id', id);
      loadItems();
      loadInventory();
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    await supabase
      .from('canteen_orders')
      .update({ status })
      .eq('id', orderId);
    loadOrders();
  };

  const updateInventory = async (inventoryId: string, quantity: number) => {
    await supabase
      .from('canteen_inventory')
      .update({ 
        stock_quantity: quantity,
        last_updated: new Date().toISOString()
      })
      .eq('id', inventoryId);
    loadInventory();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSpiceLevelEmoji = (level?: string) => {
    switch (level) {
      case 'mild': return '🟢';
      case 'medium': return '🟡';
      case 'spicy': return '🟠';
      case 'very_spicy': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-6">
        <h1 className="text-3xl font-bold">Canteen Management System</h1>
        <p className="text-red-100 mt-1">Complete management for {selectedCanteen}</p>
      </div>

      <div className="p-6">
        {/* Canteen Selection */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3">
            {canteens.map(canteen => (
              <button
                key={canteen.id}
                onClick={() => setSelectedCanteen(canteen.name)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedCanteen === canteen.name
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-red-300'
                }`}
              >
                {canteen.name}
                {canteen.description && (
                  <div className="text-xs opacity-75 mt-1">{canteen.description}</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 bg-white p-2 rounded-lg shadow-sm">
          {[
            { key: 'menu', label: 'Menu Management', icon: '🍽️' },
            { key: 'orders', label: 'Live Orders', icon: '📋' },
            { key: 'inventory', label: 'Inventory', icon: '📦' },
            { key: 'analytics', label: 'Analytics', icon: '📊' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                activeTab === tab.key
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'menu' && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Add/Edit Item Form */}
            <div className="xl:col-span-1 bg-white rounded-xl p-6 shadow-lg border">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                {editingItem ? '✏️ Edit Item' : '➕ Add New Item'}
              </h2>
              {message && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {message}
                </div>
              )}
              <form onSubmit={addOrUpdateItem} className="space-y-4">
                <input
                  type="text"
                  placeholder="Item Name *"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={3}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Price *"
                    value={newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                    step="0.01"
                  />
                  <input
                    type="number"
                    placeholder="Prep Time (min)"
                    value={newItem.preparation_time}
                    onChange={(e) => setNewItem({...newItem, preparation_time: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={newItem.meal_type}
                    onChange={(e) => setNewItem({...newItem, meal_type: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="breakfast">🌅 Breakfast</option>
                    <option value="lunch">☀️ Lunch</option>
                    <option value="dinner">🌙 Dinner</option>
                  </select>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="main">Main Course</option>
                    <option value="snacks">Snacks</option>
                    <option value="beverages">Beverages</option>
                    <option value="desserts">Desserts</option>
                    <option value="combo">Combo</option>
                    <option value="thali">Thali</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={newItem.spice_level}
                    onChange={(e) => setNewItem({...newItem, spice_level: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="mild">🟢 Mild</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="spicy">🟠 Spicy</option>
                    <option value="very_spicy">🔴 Very Spicy</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Calories"
                    value={newItem.calories}
                    onChange={(e) => setNewItem({...newItem, calories: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={newItem.is_veg}
                      onChange={(e) => setNewItem({...newItem, is_veg: e.target.checked})}
                      className="w-5 h-5 text-green-600"
                    />
                    <span className="font-medium">🥬 Vegetarian</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={newItem.is_special}
                      onChange={(e) => setNewItem({...newItem, is_special: e.target.checked})}
                      className="w-5 h-5 text-red-600"
                    />
                    <span className="font-medium">🔥 Today's Special</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={newItem.available}
                      onChange={(e) => setNewItem({...newItem, available: e.target.checked})}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="font-medium">✅ Available</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </button>
                  {editingItem && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItem(null);
                        resetForm();
                      }}
                      className="px-4 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Menu Items List */}
            <div className="xl:col-span-3 bg-white rounded-xl shadow-lg border">
              <div className="p-6 border-b">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-xl font-bold">📋 Menu Items</h2>
                  <div className="flex gap-2">
                    <select
                      value={selectedMealType}
                      onChange={(e) => setSelectedMealType(e.target.value)}
                      className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                    >
                      <option value="all">All Meals</option>
                      <option value="breakfast">🌅 Breakfast</option>
                      <option value="lunch">☀️ Lunch</option>
                      <option value="dinner">🌙 Dinner</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading menu items...</p>
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🍽️</div>
                    <p className="text-gray-600 text-lg">No items found for {selectedMealType === 'all' ? 'this canteen' : selectedMealType}</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {items.map(item => (
                      <div key={item.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-lg">{item.name}</h3>
                              {item.is_special && (
                                <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                                  🔥 SPECIAL
                                </span>
                              )}
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                item.is_veg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {item.is_veg ? '🟢 VEG' : '🔴 NON-VEG'}
                              </span>
                              <span className="text-lg">{getSpiceLevelEmoji(item.spice_level)}</span>
                            </div>
                            {item.description && (
                              <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <span className="font-bold text-lg text-red-600">₹{item.price}</span>
                              <span>📅 {item.meal_type}</span>
                              <span>🏷️ {item.category}</span>
                              {item.preparation_time && <span>⏱️ {item.preparation_time}min</span>}
                              {item.calories && <span>🔥 {item.calories} cal</span>}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <button
                              onClick={() => editItem(item)}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => toggleSpecial(item.id, item.is_special)}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                item.is_special 
                                  ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                                  : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                              }`}
                            >
                              {item.is_special ? '🔥 Remove Special' : '⭐ Make Special'}
                            </button>
                            <button
                              onClick={() => toggleAvailability(item.id, item.available)}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                item.available 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              }`}
                            >
                              {item.available ? '✅ Available' : '⏸️ Unavailable'}
                            </button>
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-lg border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold flex items-center gap-2">
                📋 Live Orders
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {orders.filter(o => ['pending', 'preparing'].includes(o.status)).length} Active
                </span>
              </h2>
            </div>
            <div className="p-6">
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-gray-600 text-lg">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="border rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg">Order #{order.id.slice(0, 8)}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                              {order.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            🕰️ {new Date(order.created_at).toLocaleString()}
                            {order.estimated_time && (
                              <span className="ml-4">⏱️ Est: {order.estimated_time}min</span>
                            )}
                          </div>
                          {order.customer_notes && (
                            <div className="bg-blue-50 p-3 rounded-lg mb-3">
                              <p className="text-sm text-blue-800">
                              <span className="font-semibold">💬 Customer Notes:</span> {order.customer_notes}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-600 mb-2">₹{order.total_price}</div>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                          >
                            <option value="pending">⏳ Pending</option>
                            <option value="preparing">👨‍🍳 Preparing</option>
                            <option value="ready">✅ Ready</option>
                            <option value="completed">✓ Completed</option>
                            <option value="cancelled">❌ Cancelled</option>
                          </select>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          🍽️ Order Items:
                        </h4>
                        <div className="grid gap-2">
                          {order.items.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="font-medium">{item.name}</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  item.is_veg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {item.is_veg ? '🟢' : '🔴'}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="bg-gray-100 px-2 py-1 rounded-full text-sm font-semibold">
                                  x{item.quantity}
                                </span>
                                <span className="font-bold">₹{item.price * item.quantity}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="bg-white rounded-xl shadow-lg border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold flex items-center gap-2">
                📦 Inventory Management
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {inventory.filter(i => i.stock_quantity <= i.low_stock_threshold).length} Low Stock
                </span>
              </h2>
            </div>
            <div className="p-6">
              {inventory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-gray-600 text-lg">No inventory data available</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {inventory.map(inv => (
                    <div key={inv.id} className={`border rounded-xl p-4 ${
                      inv.stock_quantity <= inv.low_stock_threshold 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-200'
                    }`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-lg">{(inv as any).canteen_items.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span>₹{(inv as any).canteen_items.price}</span>
                            <span>🕰️ Updated: {new Date(inv.last_updated).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${
                              inv.stock_quantity <= inv.low_stock_threshold ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {inv.stock_quantity}
                            </div>
                            <div className="text-xs text-gray-500">In Stock</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateInventory(inv.id, Math.max(0, inv.stock_quantity - 10))}
                              className="px-3 py-2 bg-red-100 text-red-800 rounded-lg font-semibold hover:bg-red-200 transition-colors"
                            >
                              -10
                            </button>
                            <input
                              type="number"
                              value={inv.stock_quantity}
                              onChange={(e) => updateInventory(inv.id, parseInt(e.target.value) || 0)}
                              className="w-20 p-2 border rounded-lg text-center focus:ring-2 focus:ring-red-500"
                              min="0"
                            />
                            <button
                              onClick={() => updateInventory(inv.id, inv.stock_quantity + 10)}
                              className="px-3 py-2 bg-green-100 text-green-800 rounded-lg font-semibold hover:bg-green-200 transition-colors"
                            >
                              +10
                            </button>
                          </div>
                        </div>
                      </div>
                      {inv.stock_quantity <= inv.low_stock_threshold && (
                        <div className="mt-3 p-3 bg-red-100 rounded-lg">
                          <p className="text-red-800 text-sm font-semibold">
                            ⚠️ Low Stock Alert! Only {inv.stock_quantity} items remaining.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg border p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                📊 Today's Sales
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="font-semibold">Total Orders</span>
                  <span className="text-2xl font-bold text-green-600">
                    {orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <span className="font-semibold">Total Revenue</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ₹{orders
                      .filter(o => new Date(o.created_at).toDateString() === new Date().toDateString())
                      .reduce((sum, o) => sum + o.total_price, 0)
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                  <span className="font-semibold">Pending Orders</span>
                  <span className="text-2xl font-bold text-yellow-600">
                    {orders.filter(o => o.status === 'pending').length}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                🏆 Popular Items
              </h3>
              <div className="space-y-3">
                {items
                  .filter(item => item.available)
                  .slice(0, 5)
                  .map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </span>
                        <div>
                          <div className="font-semibold">{item.name}</div>
                          <div className="text-sm text-gray-600">₹{item.price}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">Active</div>
                        <div className="text-xs text-gray-500">{item.category}</div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}