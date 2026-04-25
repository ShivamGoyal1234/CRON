import cron, { ScheduledTask } from "node-cron";
import { CronJob } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { intervalToCron } from "@/lib/utils";

export class CronEngine {
  private static instance: CronEngine;
  private tasks = new Map<string, ScheduledTask>();

  private constructor() {}

  static getInstance(): CronEngine {
    if (!CronEngine.instance) {
      CronEngine.instance = new CronEngine();
    }
    return CronEngine.instance;
  }

  async loadAll() {
    const activeJobs = await prisma.cronJob.findMany({
      where: { isActive: true },
    });

    for (const job of activeJobs) {
      this.start(job);
    }
  }

  start(job: CronJob) {
    this.stop(job.id);

    const expression = intervalToCron(job.interval);
    const task = cron.schedule(expression, async () => {
      setTimeout(async () => {
        await this.executeJob(job.id);
      }, job.offset * 1000);
    });

    this.tasks.set(job.id, task);
  }

  stop(jobId: string) {
    const existing = this.tasks.get(jobId);
    if (!existing) return;
    existing.stop();
    existing.destroy();
    this.tasks.delete(jobId);
  }

  restart(job: CronJob) {
    this.stop(job.id);
    if (job.isActive) this.start(job);
  }

  private async executeJob(jobId: string) {
    const job = await prisma.cronJob.findUnique({ where: { id: jobId } });
    if (!job || !job.isActive) return;

    const performRequest = async () => {
      const start = Date.now();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30_000);

      try {
        const parsedHeaders = job.headers ? JSON.parse(job.headers) : undefined;
        const response = await fetch(job.url, {
          method: job.method,
          headers: parsedHeaders,
          body: job.method === "POST" ? job.body ?? undefined : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeout);
        const responseTime = Date.now() - start;
        const status = response.ok ? "success" : "failed";

        await prisma.cronLog.create({
          data: {
            jobId: job.id,
            status,
            statusCode: response.status,
            responseTime,
          },
        });

        await prisma.cronJob.update({
          where: { id: job.id },
          data: {
            lastRunAt: new Date(),
            lastStatus: status,
          },
        });

        return response.ok;
      } catch (error) {
        clearTimeout(timeout);
        const isTimeout = error instanceof Error && error.name === "AbortError";
        const status = isTimeout ? "timeout" : "failed";
        const message = error instanceof Error ? error.message : "Unknown error";
        const responseTime = Date.now() - start;

        await prisma.cronLog.create({
          data: {
            jobId: job.id,
            status,
            responseTime,
            error: message,
          },
        });

        await prisma.cronJob.update({
          where: { id: job.id },
          data: {
            lastRunAt: new Date(),
            lastStatus: status,
          },
        });

        return false;
      }
    };

    const ok = await performRequest();
    if (!ok) {
      setTimeout(async () => {
        await performRequest();
      }, 10_000);
    }
  }
}
