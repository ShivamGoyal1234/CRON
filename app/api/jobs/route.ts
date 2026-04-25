import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CronEngine } from "@/lib/cron-engine";
import { isAllowedInterval, sanitizeString } from "@/lib/utils";
import { jobSchema } from "@/lib/validators";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobs = await prisma.cronJob.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(jobs);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = jobSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  if (!isAllowedInterval(data.interval)) {
    return NextResponse.json({ error: "Unsupported interval" }, { status: 400 });
  }

  if (data.method === "GET" && data.body) {
    return NextResponse.json({ error: "GET jobs cannot include body" }, { status: 400 });
  }

  const activeCount = await prisma.cronJob.count({
    where: { userId: session.user.id, isActive: true },
  });

  if (activeCount >= 10 && (data.isActive ?? true)) {
    return NextResponse.json(
      { error: "You reached the max of 10 active jobs. Upgrade to continue." },
      { status: 400 },
    );
  }

  const offset = Math.floor(Math.random() * 60);
  const job = await prisma.cronJob.create({
    data: {
      userId: session.user.id,
      name: sanitizeString(data.name),
      url: sanitizeString(data.url),
      method: data.method,
      headers: data.headers ? sanitizeString(data.headers) : null,
      body: data.body ? sanitizeString(data.body) : null,
      interval: data.interval,
      offset,
      isActive: data.isActive ?? true,
    },
  });

  if (job.isActive) {
    CronEngine.getInstance().start(job);
  }

  return NextResponse.json(job, { status: 201 });
}
