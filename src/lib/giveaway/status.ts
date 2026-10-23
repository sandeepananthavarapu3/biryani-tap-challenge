type GiveawaySchedule = {
  id: string;
  status: 'draft' | 'scheduled' | 'live' | 'ended';
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
};

export function derivedEndTime(giveaway: GiveawaySchedule): string | null {
  if (giveaway.end_time) return giveaway.end_time;
  if (!giveaway.start_time || !giveaway.duration_minutes) return null;

  return new Date(new Date(giveaway.start_time).getTime() + giveaway.duration_minutes * 60_000).toISOString();
}

export function effectiveGiveawayStatus(giveaway: GiveawaySchedule, now = Date.now()): GiveawaySchedule['status'] {
  let status = giveaway.status;
  if ((status === 'scheduled' || status === 'live') && giveaway.start_time && new Date(giveaway.start_time).getTime() <= now) {
    status = 'live';
  }
  const endTime = derivedEndTime(giveaway);
  if (status === 'live' && endTime && new Date(endTime).getTime() <= now) return 'ended';
  return status;
}

export async function syncGiveawayStatus<T extends GiveawaySchedule>(adminClient: any, giveaway: T): Promise<T> {
  const status = effectiveGiveawayStatus(giveaway);
  const endTime = derivedEndTime(giveaway);
  const needsUpdate = status !== giveaway.status || (!giveaway.end_time && !!endTime);
  if (!needsUpdate) return giveaway;

  const { data } = await adminClient
    .from('giveaways')
    .update({ status, ...(endTime ? { end_time: endTime } : {}) })
    .eq('id', giveaway.id)
    .select()
    .single();

  return (data || { ...giveaway, status, end_time: endTime || giveaway.end_time }) as T;
}
