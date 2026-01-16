import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const {
      name,
      gender,
      budget,
      location,
      preferences,
      contact,
      image_url,
      available,
      owner_id
    } = body;

    if (!name || !contact || !owner_id) {
      return NextResponse.json(
        { error: 'Missing required fields: name, contact, owner_id' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('roommates_admin')
      .insert({
        name,
        gender: gender || null,
        budget: budget || null,
        location: location || null,
        preferences: preferences || null,
        contact,
        image_url: image_url ?? null,
        available: available !== false,
        owner_id
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to add roommate' },
      { status: 500 }
    );
  }
}
