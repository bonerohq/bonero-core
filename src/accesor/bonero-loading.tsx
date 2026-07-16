export function BoneroLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-tafu-black text-tafu-yellow">
      <div className="flex flex-col items-center gap-6">
        <div className="text-2xl font-bold tracking-[0.3em] uppercase">TAFU</div>
        <div className="h-1 w-32 overflow-hidden rounded-full bg-tafu-yellow/20">
          <div className="h-full w-1/2 animate-[bonero-load_1.2s_ease-in-out_infinite] rounded-full bg-tafu-yellow" />
        </div>
        <p className="text-sm text-tafu-yellow/70">Yükleniyor…</p>
      </div>
    </div>
  );
}
