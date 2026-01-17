import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phone, message, order_id, canteen } = await request.json();

    // WhatsApp Cloud API configuration
    const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
      console.log('WhatsApp credentials not configured, logging message:', message);
      return NextResponse.json({ success: true, method: 'logged' });
    }

    // Send message via WhatsApp Cloud API
    const whatsappResponse = await fetch(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone.replace('+', ''),
          type: 'text',
          text: {
            body: message
          }
        })
      }
    );

    const result = await whatsappResponse.json();

    if (whatsappResponse.ok) {
      console.log('WhatsApp message sent successfully:', result);
      return NextResponse.json({ success: true, messageId: result.messages[0].id });
    } else {
      console.error('WhatsApp API error:', result);
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

  } catch (error: any) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}