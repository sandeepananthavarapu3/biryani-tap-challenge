import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { effectiveGiveawayStatus } from '@/lib/giveaway/status'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    const supabase = createClient()
    
    let query = supabase.from('giveaways').select('*').order('created_at', { ascending: false })
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return NextResponse.json({ giveaways: data })
  } catch (error) {
    console.error('Error fetching giveaways:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
      
    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const body = await request.json()
    const adminClient = createAdminClient()
    const startTime = body.start_time || (body.status === 'live' ? new Date().toISOString() : null)
    const endTime = body.end_time || (
      startTime && body.duration_minutes
        ? new Date(new Date(startTime).getTime() + Number(body.duration_minutes) * 60_000).toISOString()
        : null
    )
    const status = effectiveGiveawayStatus({
      id: 'new',
      status: body.status || 'draft',
      start_time: startTime,
      end_time: endTime,
      duration_minutes: body.duration_minutes || null,
    })
    
    const { data, error } = await adminClient
      .from('giveaways')
      .insert([
        {
          ...body,
          start_time: startTime,
          end_time: endTime,
          status,
          created_by: user.id
        }
      ])
      .select()
      .single()
      
    if (error) throw error
    
    return NextResponse.json({ giveaway: data })
  } catch (error) {
    console.error('Error creating giveaway:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
