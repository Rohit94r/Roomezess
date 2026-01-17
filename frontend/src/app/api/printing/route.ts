import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { items, totalPrice, notes, fileUrl, pageSize, colorMode, sides, pages, copies } = await request.json();

    // Store order in database
    const { data, error } = await supabase
      .from('orders')
      .insert({
        items,
        total_price: totalPrice,
        notes,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send email via Nodemailer
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER || 'roomezes5@gmail.com',
          pass: process.env.GMAIL_PASS || 'yxex xbzb qhdw tddj'
        }
      });

      const emailBody = `Hello,

A new print job has been placed.

Order ID: ${data.id}

Details:
- Page Size: ${pageSize}
- Color: ${colorMode}
- Sides: ${sides}
- Pages: ${pages}
- Copies: ${copies}
- Total Price: ₹${totalPrice}

Document URL:
${fileUrl}

Notes: ${notes}

Please process this order.

Roomezes`;

      await transporter.sendMail({
        from: process.env.GMAIL_USER || 'roomezes5@gmail.com',
        to: 'roomezes5@gmail.com',
        subject: 'New Print Job Request',
        text: emailBody
      });

      console.log('Email sent successfully');
    } catch (emailError) {
      console.log('Email sending failed:', emailError);
      // Continue anyway - order is saved
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Order placed successfully! Email sent to admin.'
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}