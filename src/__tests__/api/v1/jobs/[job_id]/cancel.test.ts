
import { POST } from '@/app/api/v1/jobs/[job_id]/cancel/route';
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
    cancel: jest.fn(),
  },
}));

describe('jobs/[job_id]/cancel/route.ts', () => {
  const params = Promise.resolve({ job_id: 'job_123' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    (auth as jest.Mock).mockResolvedValue({ userId: null });
    const req = new Request('http://localhost', { method: 'POST' });
    const response = await POST(req, { params });
    expect(response.status).toBe(401);
  });

  it('should cancel the run if job exists and has active run', async () => {
    (auth as jest.Mock).mockResolvedValue({ userId: 'user_1' });
    (prisma.job.findFirst as jest.Mock).mockResolvedValue({ id: 'job_123' });
    (runs.list as jest.Mock).mockResolvedValue({ data: [{ id: 'run_1' }] });
    (runs.cancel as jest.Mock).mockResolvedValue({});

    const req = new Request('http://localhost', { method: 'POST' });
    const response = await POST(req, { params });

    expect(response.status).toBe(200);
    expect(runs.cancel).toHaveBeenCalledWith('run_1');
  });

  it('should return 404 if job not found', async () => {
    (auth as jest.Mock).mockResolvedValue({ userId: 'user_1' });
    (prisma.job.findFirst as jest.Mock).mockResolvedValue(null);

    const req = new Request('http://localhost', { method: 'POST' });
    const response = await POST(req, { params });
    expect(response.status).toBe(404);
  });

  it('should return 404 if no active run found', async () => {
    (auth as jest.Mock).mockResolvedValue({ userId: 'user_1' });
    (prisma.job.findFirst as jest.Mock).mockResolvedValue({ id: 'job_123' });
    (runs.list as jest.Mock).mockResolvedValue({ data: [] });

    const req = new Request('http://localhost', { method: 'POST' });
    const response = await POST(req, { params });
    expect(response.status).toBe(404);
  });

  it('should return 500 on internal error', async () => {
    (auth as jest.Mock).mockResolvedValue({ userId: 'user_1' });
    (prisma.job.findFirst as jest.Mock).mockRejectedValue(new Error('DB Error'));

    const req = new Request('http://localhost', { method: 'POST' });
    const response = await POST(req, { params });
    expect(response.status).toBe(500);
  });
});
