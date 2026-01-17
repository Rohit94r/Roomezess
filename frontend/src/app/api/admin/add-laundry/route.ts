import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { name, description, price, image_url, phone, address, pricing_details } = await request.json();

    if (!name || !price) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    // First ensure laundry_shops table exists
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS laundry_shops (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(200) NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL DEFAULT 0,
          image_url TEXT,
          available BOOLEAN DEFAULT true,
          pricing_details JSONB,
          phone VARCHAR(15),
          address TEXT,
          owner_id UUID,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        ALTER TABLE laundry_shops DISABLE ROW LEVEL SECURITY;
      `
    });

    if (createError) {
      console.log('Table creation warning:', createError);
    }

    const { data, error } = await supabase
      .from('laundry_shops')
      .insert({
        name,
        description,
        price: parseFloat(price),
        image_url,
        phone,
        address,
        pricing_details,
        available: true
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET method to fetch all laundry shops
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('laundry_shops')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}