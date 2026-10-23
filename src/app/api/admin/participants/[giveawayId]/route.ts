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
    
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    
    const adminClient = createAdminClient()
    
    let query = adminClient
      .from('profiles')
      .select(`
        id, name, email, avatar_url, is_admin, email_verified, created_at, updated_at,
        game_sessions:game_sessions!inner(id, session_type, status, current_round, total_reaction_time, fastest_reaction_time, wrong_taps, early_taps, is_suspicious, suspicious_reason, started_at, completed_at, created_at, game_rounds(*)),
        leaderboard_entries!left(*)
      `)
      .eq('game_sessions.giveaway_id', params.giveawayId)
      .eq('game_sessions.session_type', 'official')
      
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    const formatted = data.map((d: any) => ({
      profile: {
        id: d.id,
        name: d.name,
        email: d.email,
        avatar_url: d.avatar_url,
        is_admin: d.is_admin,
        email_verified: d.email_verified,
        created_at: d.created_at,
        updated_at: d.updated_at
      },
      session: d.game_sessions[0] || null,
      rounds: d.game_sessions[0]?.game_rounds || [],
      leaderboard_entry: d.leaderboard_entries[0] || null
    }))
    
    return NextResponse.json({ participants: formatted })
  } catch (error) {
    console.error('Error fetching participants:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
