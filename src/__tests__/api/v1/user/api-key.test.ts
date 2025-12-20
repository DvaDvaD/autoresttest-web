import { GET } from "@/app/api/v1/user/api-key/route";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
  currentUser: jest.fn(),
}));

describe("GET /api/v1/user/api-key", () => {
  it("should return 401 if user is not authenticated", async () => {
    jest.mocked(auth).mockResolvedValue({ userId: null } as any);
    jest.mocked(currentUser).mockResolvedValue(null);

    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("should return existing API key if it exists", async () => {
    jest.mocked(auth).mockResolvedValue({ userId: "user_123" } as any);
    jest
      .mocked(currentUser)
      .mockResolvedValue({
        id: "user_123",
        emailAddresses: [{ emailAddress: "test@example.com" }],
      } as any);

    jest.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user_123",
      apiKey: { key: "art_existingkey" },
    } as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.apiKey).toBe("art_existingkey");
  });

  it("should generate and return a new API key if none exists", async () => {
    jest.mocked(auth).mockResolvedValue({ userId: "user_123" } as any);
    jest
      .mocked(currentUser)
      .mockResolvedValue({
        id: "user_123",
        emailAddresses: [{ emailAddress: "test@example.com" }],
      } as any);

    jest.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user_123",
      apiKey: null,
    } as any);

    jest.mocked(prisma.user.upsert).mockImplementation(({ create }: any) => {
      // simulate the key creation logic essentially
      // returning what the DB would return (or close enough for this test)
      // We really just want to verify the key starts with art_
      return Promise.resolve({
        id: "user_123",
        email: "test@example.com",
        apiKey: { key: create.apiKey.create.key },
      });
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.apiKey).toMatch(/^art_[a-f0-9]{32}$/);

    expect(prisma.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user_123" },
      }),
    );
  });

  it("should return 400 if user has no email", async () => {
    jest.mocked(auth).mockResolvedValue({ userId: "user_123" } as any);
    jest
      .mocked(currentUser)
      .mockResolvedValue({ id: "user_123", emailAddresses: [] } as any);

    jest.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user_123",
      apiKey: null,
    } as any);

    const response = await GET();
    expect(response.status).toBe(400);
  });

  it("should return 500 on internal error", async () => {
    jest.mocked(auth).mockRejectedValue(new Error("Internal error"));

    const response = await GET();
    expect(response.status).toBe(500);
  });
});
