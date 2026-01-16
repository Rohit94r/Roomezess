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
      title,
      description,
      rent,
      distance_km,
      amenities,
      contact,
      image_url,
      map_link,
      room_type,
      furnishing,
      available,
      owner_id
    } = body;

    if (!title || !rent || !contact || !owner_id) {
      return NextResponse.json(
        { error: 'Missing required fields: title, rent, contact, owner_id' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('rooms')
      .insert({
        title,
        description: description || null,
        rent,
        distance_km: distance_km || null,
        amenities: amenities || [],
        contact,
        image_url: image_url ?? null,
        map_link: map_link ?? null,
        room_type: room_type || null,
        furnishing: furnishing || null,
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
      { error: error.message || 'Failed to add room' },
      { status: 500 }
    );
  }
}
