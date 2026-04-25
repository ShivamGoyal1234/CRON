import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CronEngine } from "@/lib/cron-engine";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(_: NextRequest, context: Context) {
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

  if (!existing.isActive) {
    const activeCount = await prisma.cronJob.count({
      where: { userId: session.user.id, isActive: true },
    });
    if (activeCount >= 10) {
      return NextResponse.json(
        { error: "You reached the max of 10 active jobs. Upgrade to continue." },
        { status: 400 },
      );
    }
  }

  const updated = await prisma.cronJob.update({
    where: { id },
    data: { isActive: !existing.isActive },
  });

  if (updated.isActive) {
    CronEngine.getInstance().start(updated);
  } else {
    CronEngine.getInstance().stop(updated.id);
  }

  return NextResponse.json(updated);
}
