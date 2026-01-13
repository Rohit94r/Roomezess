import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, description, price, category, service_type, available, owner_id } = body || {}
    if (
      !name ||
      !service_type ||
      !owner_id ||
      typeof price !== 'number' ||
      Number.isNaN(price)
    ) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    const supabaseAdmin = getSupabaseAdmin()
    const payload = {
      name,
      description: description ?? '',
      price,
      category: category ?? null,
      service_type,
      available: available ?? true,
      owner_id,
    }
    const { data, error } = await supabaseAdmin
      .from('services')
      .insert(payload)
      .select()
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal Server Error' }, { status: 500 })
  }
}
