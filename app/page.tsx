import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-4xl font-bold">Cron Job Management System</h1>
      <p className="text-gray-600">Manage and monitor your ping jobs from one dashboard.</p>
      <div className="flex gap-3">
        <Link href="/login" className="rounded-md bg-black px-4 py-2 text-white">
          Login
        </Link>
        <Link href="/register" className="rounded-md border px-4 py-2">
          Register
        </Link>
      </div>
    </div>
  );
}
