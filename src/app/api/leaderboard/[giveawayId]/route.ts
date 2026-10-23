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
    
    const adminClient = createAdminClient()
    
    const { data: giveaway } = await adminClient
      .from('giveaways')
      .select('id, title, status, winner_id, winner_name, winner_total_time')
      .eq('id', params.giveawayId)
      .single()
      
    if (!giveaway) {
      return NextResponse.json({ error: 'Giveaway not found' }, { status: 404 })
    }
    
    const { data: entries, error } = await adminClient
      .from('leaderboard_entries')
      .select('*')
      .eq('giveaway_id', params.giveawayId)
      .eq('is_suspicious', false)
      .order('rank', { ascending: true })
      
    if (error) throw error
    
    let current_user_rank = undefined
    if (user) {
      const userEntry = entries?.find(e => e.user_id === user.id)
      if (userEntry && userEntry.rank !== null) {
        current_user_rank = userEntry.rank
      }
    }
    
    return NextResponse.json({
      entries: entries || [],
      current_user_rank,
      total_participants: entries?.length || 0,
      giveaway
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
