import { StatusBadge } from "@/components/StatusBadge";

type Log = {
  id: string;
  status: string;
  statusCode?: number | null;
  responseTime?: number | null;
  error?: string | null;
  createdAt: string | Date;
};

export function LogTable({ logs }: { logs: Log[] }) {
  if (!logs.length) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-sm text-gray-500">
        No execution logs yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-gray-50">
          <tr>
            <th className="p-3">Timestamp</th>
            <th className="p-3">Status</th>
            <th className="p-3">Code</th>
            <th className="p-3">Response (ms)</th>
            <th className="p-3">Error</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b last:border-none">
              <td className="p-3">{new Date(log.createdAt).toLocaleString()}</td>
              <td className="p-3">
                <StatusBadge status={log.status} />
              </td>
              <td className="p-3">{log.statusCode ?? "-"}</td>
              <td className="p-3">{log.responseTime ?? "-"}</td>
              <td className="p-3 text-red-600">{log.error ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
