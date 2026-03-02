import cron from "node-cron";
import { broadcast } from "./websocket.js";

type FetchJob = {
    name: string;
    schedule: string;
    channel: string;
    fetchFn: () => Promise<unknown>;
    enabled: boolean;
};

const jobs: FetchJob[] = [];
const tasks: cron.ScheduledTask[] = [];

export function registerJob(job: FetchJob): void {
    jobs.push(job);
}

export function startScheduler(): void {
    console.log("[Scheduler] Starting scheduled data fetchers...");

    for (const job of jobs) {
        if (!job.enabled) {
            console.log(`[Scheduler] ${job.name} — DISABLED`);
            continue;
        }

        const task = cron.schedule(job.schedule, async () => {
            try {
                const data = await job.fetchFn();
                if (data) {
                    broadcast(job.channel as any, data);
                }
            } catch (err) {
                console.error(`[Scheduler] ${job.name} failed:`, (err as Error).message);
            }
        });

        tasks.push(task);
        console.log(`[Scheduler] ${job.name} — ${job.schedule}`);
    }

    console.log(`[Scheduler] ${tasks.length} jobs registered`);
}

export function stopScheduler(): void {
    for (const task of tasks) {
        task.stop();
    }
    tasks.length = 0;
    console.log("[Scheduler] All jobs stopped");
}

export function getSchedulerStatus() {
    return jobs.map((j) => ({
        name: j.name,
        schedule: j.schedule,
        channel: j.channel,
        enabled: j.enabled,
    }));
}
