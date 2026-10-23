import GiveawayPageClient from './GiveawayPageClient';

export default function GiveawayPage({ params }: { params: { id: string } }) {
  return <GiveawayPageClient id={params.id} />;
}
