"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LogTable } from "@/components/LogTable";

const intervals = [2, 5, 15, 20, 30, 60];

type Job = {
  id: string;
  name: string;
  url: string;
  method: "GET" | "POST";
  headers?: string | null;
  body?: string | null;
  interval: number;
  isActive: boolean;
};

type Log = {
  id: string;
  status: string;
  statusCode?: number | null;
  responseTime?: number | null;
  error?: string | null;
  createdAt: string;
};

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [error, setError] = useState("");

  async function loadData() {
    const jobsRes = await fetch("/api/jobs");
    if (!jobsRes.ok) {
      setError("Unable to load job.");
      return;
    }
    const allJobs = await jobsRes.json();
    const current = allJobs.find((j: Job) => j.id === params.id);
    if (!current) {
      setError("Job not found");
      return;
    }
    setJob(current);

    const logsRes = await fetch(`/api/jobs/${params.id}/logs`);
    if (logsRes.ok) {
      setLogs(await logsRes.json());
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const uptime = useMemo(() => {
    if (!logs.length) return 0;
    const sample = logs.slice(0, 100);
    const ok = sample.filter((log) => log.status === "success").length;
    return Math.round((ok / sample.length) * 100);
  }, [logs]);

  const avgResponse = useMemo(() => {
    const values = logs.map((log) => log.responseTime).filter(Boolean) as number[];
    if (!values.length) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }, [logs]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!job) return;
    const res = await fetch(`/api/jobs/${job.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(job),
    });
    if (!res.ok) {
      setError("Failed to update job");
      return;
    }
    await loadData();
  }

  if (error) return <main className="p-6 text-red-600">{error}</main>;
  if (!job) return <main className="p-6">Loading...</main>;

  return (
    <main className="mx-auto max-w-5xl p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Job Details</h1>
        <button onClick={() => router.push("/dashboard")} className="rounded-md border px-3 py-2">
          Back
        </button>
      </div>

      <form onSubmit={onSave} className="mb-6 space-y-4 rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Settings</h2>
        <input className="w-full rounded-md border p-2" value={job.name} onChange={(e) => setJob({ ...job, name: e.target.value })} />
        <input className="w-full rounded-md border p-2" value={job.url} onChange={(e) => setJob({ ...job, url: e.target.value })} />
        <select className="w-full rounded-md border p-2" value={job.method} onChange={(e) => setJob({ ...job, method: e.target.value as "GET" | "POST" })}>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
        </select>
        <textarea className="w-full rounded-md border p-2" rows={3} value={job.headers ?? ""} onChange={(e) => setJob({ ...job, headers: e.target.value })} placeholder="Headers JSON" />
        {job.method === "POST" ? (
          <textarea className="w-full rounded-md border p-2" rows={4} value={job.body ?? ""} onChange={(e) => setJob({ ...job, body: e.target.value })} placeholder="Body JSON" />
        ) : null}
        <select className="w-full rounded-md border p-2" value={job.interval} onChange={(e) => setJob({ ...job, interval: Number(e.target.value) })}>
          {intervals.map((item) => (
            <option key={item} value={item}>
              {item} minutes
            </option>
          ))}
        </select>
        <button className="rounded-md bg-black px-4 py-2 text-white">Save</button>
      </form>

      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Uptime (last 100 runs)</p>
          <p className="text-2xl font-bold">{uptime}%</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Avg response time</p>
          <p className="text-2xl font-bold">{avgResponse} ms</p>
        </div>
      </div>

      <h2 className="mb-2 text-lg font-semibold">Execution Logs</h2>
      <LogTable logs={logs} />
    </main>
  );
}
