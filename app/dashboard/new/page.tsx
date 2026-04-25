"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const intervals = [2, 5, 15, 20, 30, 60];

export default function NewJobPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState<"GET" | "POST">("GET");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("");
  const [interval, setIntervalValue] = useState(5);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, url, method, headers: headers || null, body: body || null, interval }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to create job");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="mx-auto max-w-2xl p-4 md:p-6">
      <h1 className="mb-4 text-2xl font-bold">Create New Job</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-white p-6">
        <input className="w-full rounded-md border p-2" placeholder="Job name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="w-full rounded-md border p-2" placeholder="https://example.com/api/ping" value={url} onChange={(e) => setUrl(e.target.value)} required />
        <select className="w-full rounded-md border p-2" value={method} onChange={(e) => setMethod(e.target.value as "GET" | "POST")}>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
        </select>
        <textarea className="w-full rounded-md border p-2" placeholder='Headers JSON (optional), e.g {"Authorization":"Bearer x"}' value={headers} onChange={(e) => setHeaders(e.target.value)} rows={3} />
        {method === "POST" ? (
          <textarea className="w-full rounded-md border p-2" placeholder='Body JSON (optional), e.g {"ping":"ok"}' value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
        ) : null}
        <select className="w-full rounded-md border p-2" value={interval} onChange={(e) => setIntervalValue(Number(e.target.value))}>
          {intervals.map((item) => (
            <option key={item} value={item}>
              {item} minutes
            </option>
          ))}
        </select>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button className="rounded-md bg-black px-4 py-2 text-white">Create Job</button>
      </form>
    </main>
  );
}
