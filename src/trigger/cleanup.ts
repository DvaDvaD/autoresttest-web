import { schedules } from "@trigger.dev/sdk";
import { prisma } from "@/lib/prisma";

export const cleanupStuckJobs = schedules.task({
  id: "cleanup-stuck-jobs",
  // Run every hour
  cron: "0 * * * *",
  run: async (payload, { ctx }) => {
    const oneHourAgo = new Date(Date.now() - 1000 * 60 * 60);

    const stuckJobs = await prisma.job.findMany({
      where: {
        status: "queued",
        createdAt: {
          lt: oneHourAgo,
        },
      },
      select: {
        id: true,
      },
    });

    if (stuckJobs.length === 0) {
      console.log("No stuck jobs found. Nothing to clean up.");
      return {
        count: 0,
        jobIds: [],
      };
    }

    const jobIds = stuckJobs.map((job) => job.id);

    await prisma.job.updateMany({
      where: {
        id: {
          in: jobIds,
        },
      },
      data: {
        status: "failed",
        statusMessage:
          "Cleaned up by system: Job was stuck in queued state for over an hour.",
      },
    });

    console.log(`Cleaned up ${jobIds.length} stuck jobs:`, jobIds);

    return {
      count: jobIds.length,
      jobIds,
    };
  },
});
