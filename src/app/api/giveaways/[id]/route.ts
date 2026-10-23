import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { syncGiveawayStatus } from '@/lib/giveaway/status'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('giveaways')
      .select('*')
      .eq('id', params.id)
      .single()
      
    if (error) throw error
    
    const giveaway = await syncGiveawayStatus(createAdminClient(), data)
    return NextResponse.json({ giveaway })
  } catch (error) {
    console.error('Error fetching giveaway:', error)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
      
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    
    const body = await request.json()
    const adminClient = createAdminClient()
    
    const { data, error } = await adminClient
      .from('giveaways')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()
      
    if (error) throw error
    
    return NextResponse.json({ giveaway: data })
  } catch (error) {
    console.error('Error updating giveaway:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
      
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    
    const adminClient = createAdminClient()
    
    const { error } = await adminClient
      .from('giveaways')
      .delete()
      .eq('id', params.id)
      
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting giveaway:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
