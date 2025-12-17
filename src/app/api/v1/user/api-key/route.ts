import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function GET() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { apiKey: true },
    });

    if (dbUser && dbUser.apiKey) {
      return NextResponse.json({ apiKey: dbUser.apiKey.key });
    }

    const apiKey = `art_${randomBytes(16).toString("hex")}`;
    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return new NextResponse("User has no email address", { status: 400 });
    }

    await prisma.user.upsert({
      where: { id: userId },
      update: {
        apiKey: {
          create: {
            key: apiKey,
          },
        },
      },
      create: {
        id: userId,
        email: userEmail,
        apiKey: {
          create: {
            key: apiKey,
          },
        },
      },
    });

    return NextResponse.json({ apiKey });
  } catch (error) {
    console.error("[USER_API_KEY_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
