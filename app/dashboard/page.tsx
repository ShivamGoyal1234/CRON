"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { JobCard } from "@/components/JobCard";

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

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadJobs() {
    setLoading(true);
    const res = await fetch("/api/jobs");
    if (!res.ok) {
      setError("Please login to continue.");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setJobs(data);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadJobs();
  }, []);

  async function onToggle(id: string) {
    await fetch(`/api/jobs/${id}/toggle`, { method: "PATCH" });
    await loadJobs();
  }

  async function onDelete(id: string) {
    await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    await loadJobs();
  }

  return (
    <main className="mx-auto max-w-5xl p-4 md:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">My Cron Jobs</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/new" className="rounded-md bg-black px-4 py-2 text-white">
            New Job
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="rounded-md border px-4 py-2">
            Logout
          </button>
        </div>
      </div>

      {loading ? <p>Loading...</p> : null}
      {error ? <p className="text-red-600">{error}</p> : null}

      {!loading && !jobs.length ? (
        <div className="rounded-xl border border-dashed bg-white p-8 text-center">
          <h2 className="text-lg font-semibold">No cron jobs yet</h2>
          <p className="mt-1 text-sm text-gray-600">Create your first monitoring/ping job.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </div>
      )}
    </main>
  );
}
