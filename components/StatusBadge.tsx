type Status = "success" | "failed" | "timeout" | "paused" | "active";

export function StatusBadge({ status }: { status: Status | string | null }) {
  const value = (status ?? "paused").toLowerCase();

  const classes =
    value === "success" || value === "active"
      ? "bg-green-100 text-green-700"
      : value === "failed" || value === "timeout"
        ? "bg-red-100 text-red-700"
        : "bg-yellow-100 text-yellow-700";

  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${classes}`}>
      {value}
    </span>
  );
}
