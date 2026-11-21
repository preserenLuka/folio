export default function Loading() {
  return (
    <div className="space-y-5" aria-busy aria-label="Loading">
      <div className="skeleton h-9 w-2/3" />
      <div className="skeleton h-4 w-1/3" />
      <div className="skeleton h-40 w-full !rounded-3xl" />
      <div className="flex gap-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton aspect-[2/3] w-28" />)}</div>
      <div className="skeleton h-20 w-full" />
    </div>
  );
}
