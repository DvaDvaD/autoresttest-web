
import { PATCH } from '@/app/api/v1/jobs/[job_id]/progress/route';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    job: {
      updateMany: jest.fn(),
    },
  },
}));

describe('jobs/[job_id]/progress/route.ts', () => {
  const params = Promise.resolve({ job_id: 'job_123' });
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...ORIGINAL_ENV, INTERNAL_API_KEY: 'secret_key' };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('should return 500 if INTERNAL_API_KEY is not set', async () => {
    delete process.env.INTERNAL_API_KEY;
    const req = new Request('http://localhost', { method: 'PATCH' });
    const response = await PATCH(req, { params });
    expect(response.status).toBe(500);
  });

  it('should return 401 if authorization header is invalid', async () => {
    const req = new Request('http://localhost', {
      method: 'PATCH',
      headers: { Authorization: 'Bearer wrong_key' },
    });
    const response = await PATCH(req, { params });
    expect(response.status).toBe(401);
  });

  it('should update job progress if valid', async () => {
    (prisma.job.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
    
    const body = {
      stage: 'test_stage',
      percentage: 50,
      details: 'testing',
    };

    const req = new Request('http://localhost', {
      method: 'PATCH',
      headers: { Authorization: 'Bearer secret_key' },
      body: JSON.stringify(body),
    });

    const response = await PATCH(req, { params });
    expect(response.status).toBe(200);
    
    expect(prisma.job.updateMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { 
            id: 'job_123',
            status: {
                notIn: ["failed", "cancelled", "completed"],
            },
        },
        data: {
            currentOperation: 'test_stage',
            progressPercentage: 50,
            statusMessage: 'testing',
            status: 'running',
        }
    }));
  });

  it('should return success message but no update if job is in terminal state', async () => {
    (prisma.job.updateMany as jest.Mock).mockResolvedValue({ count: 0 });
    
    const body = { stage: 'test' };
    const req = new Request('http://localhost', {
      method: 'PATCH',
      headers: { Authorization: 'Bearer secret_key' },
      body: JSON.stringify(body),
    });

    const response = await PATCH(req, { params });
    const data = await response.json();
    
    // The code returns 200 with a specific message
    expect(response.status).toBe(200);
    expect(data.message).toContain('terminal state');
  });

  it('should return 400 for invalid request body', async () => {
    const body = { stage: 123 }; // Invalid type for stage (expected string)
    const req = new Request('http://localhost', {
      method: 'PATCH',
      headers: { Authorization: 'Bearer secret_key' },
      body: JSON.stringify(body),
    });

    const response = await PATCH(req, { params });
    expect(response.status).toBe(400);
  });

  it('should return 404 if Prisma throws P2025 (Record not found)', async () => {
    const error = new Error('Record not found');
    error.name = 'PrismaClientKnownRequestError';
    // @ts-ignore
    error.code = 'P2025';

    (prisma.job.updateMany as jest.Mock).mockRejectedValue(error);
    
    const body = { stage: 'test' };
    const req = new Request('http://localhost', {
      method: 'PATCH',
      headers: { Authorization: 'Bearer secret_key' },
      body: JSON.stringify(body),
    });

    const response = await PATCH(req, { params });
    expect(response.status).toBe(404);
  });

  it('should return 500 on generic error', async () => {
    (prisma.job.updateMany as jest.Mock).mockRejectedValue(new Error('Generic DB Error'));
    
    const body = { stage: 'test' };
    const req = new Request('http://localhost', {
      method: 'PATCH',
      headers: { Authorization: 'Bearer secret_key' },
      body: JSON.stringify(body),
    });

    const response = await PATCH(req, { params });
    expect(response.status).toBe(500);
  });
});
