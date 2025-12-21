import { prisma } from "@/lib/prisma";

const DEMO_USER_EMAIL = "test@account.com";

/**
 * Checks if the user with the given ID is the demo user.
 * If so, throws an error to prevent mutating actions.
 */
export async function ensureUserCanMutate(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (user?.email === DEMO_USER_EMAIL) {
    throw new Error("Demo account is read-only.");
  }
}
