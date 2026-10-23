import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: Request,
  { params }: { params: { giveawayId: string } }
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
    
    const { count: total_registrations } = await adminClient
      .from('game_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('giveaway_id', params.giveawayId)
      
    const { count: verified_participants } = await adminClient
      .from('game_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('giveaway_id', params.giveawayId)
      .eq('session_type', 'official')
      
    const { count: official_attempts_completed } = await adminClient
      .from('game_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('giveaway_id', params.giveawayId)
      .eq('session_type', 'official')
      .eq('status', 'completed')
      
    const { data: leader } = await adminClient
      .from('leaderboard_entries')
      .select('*')
      .eq('giveaway_id', params.giveawayId)
      .eq('rank', 1)
      .single()
      
    return NextResponse.json({
      total_registrations: total_registrations || 0,
      verified_participants: verified_participants || 0,
      official_attempts_completed: official_attempts_completed || 0,
      current_leader: leader || null
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
