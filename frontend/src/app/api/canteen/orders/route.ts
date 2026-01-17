import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { user_id, canteen_id, items, total_price, payment_id } = await request.json();

    if (!user_id || !canteen_id || !items || !total_price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create order
    const { data: order, error } = await supabase
      .from('canteen_orders')
      .insert({
        user_id,
        canteen_id,
        items,
        total_price,
        payment_id,
        status: 'preparing'
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get canteen name
    const { data: canteen } = await supabase
      .from('canteens')
      .select('name')
      .eq('id', canteen_id)
      .single();

    // Send WhatsApp notification
    await sendWhatsAppNotification(order, canteen?.name || 'Unknown', items);

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function sendWhatsAppNotification(order: any, canteenName: string, items: any[]) {
  try {
    const itemsList = items.map(item => `- ${item.name} x${item.quantity} = ₹${item.price * item.quantity}`).join('\n');
    
    const message = `🍽️ NEW ORDER RECEIVED!

Canteen: ${canteenName}
Order ID: #${order.id.slice(0, 8)}
Time: ${new Date().toLocaleString()}

Items:
${itemsList}

Total Amount: ₹${order.total_price}
Payment: PAID ✅
Pickup: Immediate

Please prepare the order!`;

    // Send via internal WhatsApp API
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/whatsapp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '918459262203',
        message: message,
        order_id: order.id,
        canteen: canteenName
      })
    });

    const result = await response.json();
    console.log('WhatsApp notification result:', result);
    
  } catch (error) {
    console.error('WhatsApp notification failed:', error);
  }
}