
import { POST } from '@/app/api/v1/jobs/[job_id]/replay/route';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { runs } from '@trigger.dev/sdk/v3';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    job: {
      findFirst: jest.fn(),
    },
  },
}));

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('@trigger.dev/sdk/v3', () => ({
  runs: {
    list: jest.fn(),
    replay: jest.fn(),
  },
}));

describe('jobs/[job_id]/replay/route.ts', () => {
  const params = Promise.resolve({ job_id: 'job_123' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    jest.mocked(auth).mockResolvedValue({ userId: null } as any);
    const req = new Request('http://localhost', { method: 'POST' });
    const response = await POST(req, { params });
    expect(response.status).toBe(401);
  });

  it('should replay the run if job exists and has active run', async () => {
    jest.mocked(auth).mockResolvedValue({ userId: 'user_1' } as any);
    jest.mocked(prisma.job.findFirst).mockResolvedValue({ id: 'job_123' } as any);
    jest.mocked(runs.list).mockResolvedValue({ data: [{ id: 'run_1' }] } as any);
    jest.mocked(runs.replay).mockResolvedValue({} as any);

    const req = new Request('http://localhost', { method: 'POST' });
    const response = await POST(req, { params });

    expect(response.status).toBe(200);
    expect(runs.replay).toHaveBeenCalledWith('run_1');
  });

  it('should return 404 if job not found', async () => {
    jest.mocked(auth).mockResolvedValue({ userId: 'user_1' } as any);
    jest.mocked(prisma.job.findFirst).mockResolvedValue(null);

    const req = new Request('http://localhost', { method: 'POST' });
    const response = await POST(req, { params });
    expect(response.status).toBe(404);
  });

  it('should return 404 if no run found', async () => {
    jest.mocked(auth).mockResolvedValue({ userId: 'user_1' } as any);
    jest.mocked(prisma.job.findFirst).mockResolvedValue({ id: 'job_123' } as any);
    jest.mocked(runs.list).mockResolvedValue({ data: [] } as any);

    const req = new Request('http://localhost', { method: 'POST' });
    const response = await POST(req, { params });
    expect(response.status).toBe(404);
  });

  it('should return 500 on internal error', async () => {
    jest.mocked(auth).mockResolvedValue({ userId: 'user_1' } as any);
    jest.mocked(prisma.job.findFirst).mockRejectedValue(new Error('DB Error'));

    const req = new Request('http://localhost', { method: 'POST' });
    const response = await POST(req, { params });
    expect(response.status).toBe(500);
  });
});
