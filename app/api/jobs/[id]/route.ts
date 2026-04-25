import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CronEngine } from "@/lib/cron-engine";
import { isAllowedInterval, sanitizeString } from "@/lib/utils";
import { jobSchema } from "@/lib/validators";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: Context) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await prisma.cronJob.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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

  const updated = await prisma.cronJob.update({
    where: { id },
    data: {
      name: sanitizeString(data.name),
      url: sanitizeString(data.url),
      method: data.method,
      headers: data.headers ? sanitizeString(data.headers) : null,
      body: data.body ? sanitizeString(data.body) : null,
      interval: data.interval,
      isActive: data.isActive ?? existing.isActive,
    },
  });

  CronEngine.getInstance().restart(updated);
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, context: Context) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await prisma.cronJob.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.cronJob.delete({ where: { id } });
  CronEngine.getInstance().stop(id);

  return NextResponse.json({ success: true });
}
