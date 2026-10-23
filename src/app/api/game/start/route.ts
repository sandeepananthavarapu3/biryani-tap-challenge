import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateRandomDelay, generateTargetBowl } from '@/lib/game/scoring'
import crypto from 'crypto'
import { syncGiveawayStatus } from '@/lib/giveaway/status'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('email_verified')
      .eq('id', user.id)
      .single()
      
    if (!profile?.email_verified && !user.email_confirmed_at) {
      return NextResponse.json({ error: 'Email not verified' }, { status: 403 })
    }
    
    const { giveaway_id, session_type } = await request.json()
    
    const { data: giveaway } = await supabase
      .from('giveaways')
      .select('*')
      .eq('id', giveaway_id)
      .single()
      
    const currentGiveaway = giveaway ? await syncGiveawayStatus(createAdminClient(), giveaway) : null

    if (session_type !== 'practice' && session_type !== 'official') {
      return NextResponse.json({ error: 'Invalid session type' }, { status: 400 })
    }

    const canPractice = session_type === 'practice' && currentGiveaway?.practice_enabled && ['scheduled', 'live'].includes(currentGiveaway.status)
    if (!currentGiveaway || (session_type === 'practice' ? !canPractice : currentGiveaway.status !== 'live')) {
      return NextResponse.json({ error: 'Giveaway is not live' }, { status: 400 })
    }
    
    const adminClient = createAdminClient()
    
    if (session_type === 'official') {
      // Check for existing official session
      const { data: existingSession } = await adminClient
        .from('game_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('giveaway_id', giveaway_id)
        .eq('session_type', 'official')
        .in('status', ['in_progress', 'completed'])
        .single()
        
      if (existingSession) {
        return NextResponse.json({ error: 'Official session already exists' }, { status: 400 })
      }
    }
    
    const server_seed = crypto.randomUUID()
    
    const { data: session, error: sessionError } = await adminClient
      .from('game_sessions')
      .insert({
        user_id: user.id,
        giveaway_id: giveaway_id,
        session_type,
        status: 'in_progress',
        current_round: 1,
        server_seed
      })
      .select()
      .single()
      
    if (sessionError) throw sessionError
    
    const delay_ms = generateRandomDelay()
    const target_bowl = generateTargetBowl()
    
    const { error: roundError } = await adminClient
      .from('game_rounds')
      .insert({
        session_id: session.id,
        round_number: 1,
        delay_ms,
        target_bowl
      })
      
    if (roundError) throw roundError
    
    return NextResponse.json({
      session_id: session.id,
      round_number: 1,
      delay_ms,
      target_bowl,
      server_time: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error starting game:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
