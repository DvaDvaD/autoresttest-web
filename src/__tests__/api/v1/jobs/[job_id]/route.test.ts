
import { GET, DELETE } from '@/app/api/v1/jobs/[job_id]/route';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    job: {
      findUnique: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

describe('jobs/[job_id]/route.ts', () => {
  const params = Promise.resolve({ job_id: 'job_123' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 401 if not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: null });
      const req = new Request('http://localhost');
      const response = await GET(req, { params });
      expect(response.status).toBe(401);
    });

    it('should return job if found and owned by user', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: 'user_1' });
      const mockJob = { id: 'job_123', userId: 'user_1' };
      (prisma.job.findUnique as jest.Mock).mockResolvedValue(mockJob);

      const req = new Request('http://localhost');
      const response = await GET(req, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockJob);
    });

    it('should return 404 if job not found', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: 'user_1' });
      (prisma.job.findUnique as jest.Mock).mockResolvedValue(null);

      const req = new Request('http://localhost');
      const response = await GET(req, { params });
      expect(response.status).toBe(404);
    });

    it('should return 500 on internal error', async () => {
        (auth as jest.Mock).mockResolvedValue({ userId: 'user_1' });
        (prisma.job.findUnique as jest.Mock).mockRejectedValue(new Error('DB Error'));
  
        const req = new Request('http://localhost');
        const response = await GET(req, { params });
        expect(response.status).toBe(500);
      });
  });

  describe('DELETE', () => {
    it('should return 401 if not authenticated', async () => {
        (auth as jest.Mock).mockResolvedValue({ userId: null });
        const req = new Request('http://localhost');
        const response = await DELETE(req, { params });
        expect(response.status).toBe(401);
    });

    it('should delete job if owned by user', async () => {
        (auth as jest.Mock).mockResolvedValue({ userId: 'user_1' });
        (prisma.job.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

        const req = new Request('http://localhost');
        const response = await DELETE(req, { params });
        expect(response.status).toBe(200);
    });

    it('should return 404 if job not found or not authorized', async () => {
        (auth as jest.Mock).mockResolvedValue({ userId: 'user_1' });
        (prisma.job.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

        const req = new Request('http://localhost');
        const response = await DELETE(req, { params });
        expect(response.status).toBe(404);
    });

    it('should return 500 on internal error', async () => {
        (auth as jest.Mock).mockResolvedValue({ userId: 'user_1' });
        (prisma.job.deleteMany as jest.Mock).mockRejectedValue(new Error('DB Error'));
  
        const req = new Request('http://localhost');
        const response = await DELETE(req, { params });
        expect(response.status).toBe(500);
    });
  });
});
