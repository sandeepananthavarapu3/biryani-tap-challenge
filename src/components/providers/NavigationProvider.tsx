'use client';

import { createContext, useContext, useEffect, useMemo, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { PageLoading } from '@/components/ui/PageLoading';

const NavigationContext = createContext<(action: () => void) => void>(action => action());

export function NavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const navigate = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
      if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
      const target = new URL(link.href, location.href);
      if (target.origin !== location.origin || (target.pathname === location.pathname && target.search === location.search)) return;
      event.preventDefault();
      startTransition(() => router.push(target.pathname + target.search + target.hash));
    };
    document.addEventListener('click', navigate, true);
    return () => document.removeEventListener('click', navigate, true);
  }, [router]);

  return (
    <NavigationContext.Provider value={startTransition}>
      {children}
      {pending && <PageLoading message="Opening page…" />}
    </NavigationContext.Provider>
  );
}

export function useLoadingRouter() {
  const router = useRouter();
  const startNavigation = useContext(NavigationContext);
  return useMemo(() => ({
    ...router,
    push: (...args: Parameters<typeof router.push>) => startNavigation(() => router.push(...args)),
    replace: (...args: Parameters<typeof router.replace>) => startNavigation(() => router.replace(...args)),
    refresh: () => startNavigation(() => router.refresh()),
  }), [router, startNavigation]);
}
