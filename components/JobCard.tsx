"use client";

import Link from "next/link";
import { CountdownTimer } from "@/components/CountdownTimer";
import { StatusBadge } from "@/components/StatusBadge";

type Job = {
  id: string;
  name: string;
  url: string;
  interval: number;
  isActive: boolean;
  lastRunAt?: string | null;
  lastStatus?: string | null;
  offset: number;
};

export function JobCard({
  job,
  onToggle,
  onDelete,
}: {
  job: Job;
  onToggle: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{job.name}</h3>
          <p className="line-clamp-1 text-sm text-gray-600">{job.url}</p>
        </div>
        <StatusBadge status={job.isActive ? job.lastStatus ?? "active" : "paused"} />
      </div>

      <div className="space-y-1 text-sm text-gray-700">
        <p>Interval: {job.interval} min</p>
        <p>Last Run: {job.lastRunAt ? new Date(job.lastRunAt).toLocaleString() : "Never"}</p>
        {job.isActive ? (
          <CountdownTimer interval={job.interval} offset={job.offset} lastRunAt={job.lastRunAt} />
        ) : (
          <span className="text-sm text-yellow-600">Paused</span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => onToggle(job.id)}
          className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
        >
          {job.isActive ? "Pause" : "Resume"}
        </button>
        <button
          onClick={() => onDelete(job.id)}
          className="rounded-md border border-red-200 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
        >
          Delete
        </button>
        <Link href={`/dashboard/${job.id}`} className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50">
          View Logs
        </Link>
      </div>
    </div>
  );
}
