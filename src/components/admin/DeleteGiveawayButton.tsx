'use client';

import { useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useLoadingRouter as useRouter } from '@/components/providers/NavigationProvider';

export function DeleteGiveawayButton({ id }: { id: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm('Delete this giveaway and its game data? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/giveaways/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Could not delete giveaway');
      }
      router.refresh();
    } catch (error) {
      setDeleting(false);
      window.alert(error instanceof Error ? error.message : 'Could not delete giveaway');
    }
  }

  return (
    <button type="button" onClick={handleDelete} disabled={deleting}
      className="text-gray-400 hover:text-red-400 disabled:opacity-50 transition-colors"
      title={deleting ? 'Deleting…' : 'Delete'} aria-label={deleting ? 'Deleting giveaway' : 'Delete giveaway'}>
      <TrashIcon className="w-5 h-5" />
    </button>
  );
}
