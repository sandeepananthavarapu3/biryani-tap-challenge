export function PageLoading({ message = "Loading your next page…" }: { message?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0a]/95 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-5 px-6 text-center">
        <span aria-hidden="true" className="text-5xl">🍗</span>
        <span aria-hidden="true" className="h-10 w-10 animate-spin motion-reduce:animate-none rounded-full border-4 border-amber-500/20 border-t-amber-500" />
        <p className="text-lg font-semibold text-amber-400">{message}</p>
        <p className="text-sm text-gray-400">Please wait a moment.</p>
      </div>
    </div>
  );
}
