export function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-6" role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={total}>
      <div className="mb-6 flex justify-center gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-2 rounded-full transition-all ${
              i + 1 === current
                ? "w-6 rounded bg-accent"
                : i + 1 < current
                  ? "w-2 bg-accent"
                  : "w-2 bg-border"
            }`}
          />
        ))}
      </div>
      <p className="mb-2 text-[16px] text-muted">Pytanie {current} z {total}</p>
    </div>
  );
}
