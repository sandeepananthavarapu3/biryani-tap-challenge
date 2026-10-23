import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { syncGiveawayStatus } from '@/lib/giveaway/status'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const giveawayId = searchParams.get('giveaway_id')
    const serverTime = new Date().toISOString()

    if (giveawayId) {
      const supabase = createAdminClient()
      const { data: giveaway, error } = await supabase
        .from('giveaways')
        .select('id, status, start_time, end_time, duration_minutes')
        .eq('id', giveawayId)
        .single()

      if (error || !giveaway) {
        return NextResponse.json(
          { error: 'Giveaway not found' },
          { status: 404 }
        )
      }

      const currentGiveaway = await syncGiveawayStatus(supabase, giveaway)
      let remainingSeconds = undefined
      if (currentGiveaway.end_time) {
        const endTime = new Date(currentGiveaway.end_time).getTime()
        const now = new Date(serverTime).getTime()
        remainingSeconds = Math.max(0, Math.floor((endTime - now) / 1000))
      }

      return NextResponse.json({
        server_time: serverTime,
        giveaway_end_time: currentGiveaway.end_time,
        giveaway_start_time: currentGiveaway.start_time,
        remaining_seconds: remainingSeconds
      })
    }

    return NextResponse.json({ server_time: serverTime })
  } catch (error) {
    console.error('Server time error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
