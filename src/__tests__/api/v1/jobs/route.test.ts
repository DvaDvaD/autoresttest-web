
import { GET, POST } from '@/app/api/v1/jobs/route';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { tasks } from '@trigger.dev/sdk/v3';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    job: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    userApiKey: {
        findUnique: jest.fn(),
    }
  },
}));

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('@trigger.dev/sdk/v3', () => ({
  tasks: {
    trigger: jest.fn(),
  },
}));

describe('jobs/route.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 401 if not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: null });
      const response = await GET();
      expect(response.status).toBe(401);
    });

    it('should return list of jobs for authenticated user', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: 'user_123' });
      const mockJobs = [{ id: 'job_1', status: 'completed' }];
      (prisma.job.findMany as jest.Mock).mockResolvedValue(mockJobs);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockJobs);
      expect(prisma.job.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: 'user_123' },
      }));
    });
    
    it('should handle errors', async () => {
        (auth as jest.Mock).mockRejectedValue(new Error('DB Error'));
        const response = await GET();
        expect(response.status).toBe(500);
    });
  });

  describe('POST', () => {
    const validBody = {
      spec: 'openapi: 3.0.0...',
      config: {
        baseUrl: 'http://example.com',
      },
    };

    it('should return 401 if not authenticated (Clerk)', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: null });
      const req = new Request('http://localhost/api/v1/jobs', {
        method: 'POST',
        body: JSON.stringify(validBody),
      });
      const response = await POST(req);
      expect(response.status).toBe(401);
    });

    it('should authenticate with Bearer token if Clerk auth fails', async () => {
       (auth as jest.Mock).mockResolvedValue({ userId: null });
       (prisma.userApiKey.findUnique as jest.Mock).mockResolvedValue({ userId: 'user_from_key' });
       
       const req = new Request('http://localhost/api/v1/jobs', {
         method: 'POST',
         headers: { 'Authorization': 'Bearer art_testkey' },
         body: JSON.stringify(validBody),
       });
       
       // Mock config validation passing (assuming simple safeParse logic in code or simple mock)
       // The code uses configSchema.safeParse. We rely on actual zod schema or mock logic if complex.
       // Since we didn't mock schema, it runs real zod. 'spec' and 'config' keys are needed.
       // The code: configSchema.safeParse({ spec_file_content: spec, user_id: jobOwnerId, ...config })
       
       (prisma.job.create as jest.Mock).mockResolvedValue({ id: 'job_new' });
       
       const response = await POST(req);
       expect(response.status).toBe(202);
       expect(prisma.job.create).toHaveBeenCalledWith(expect.objectContaining({
           data: expect.objectContaining({ userId: 'user_from_key' })
       }));
    });

    it('should return 401 if API key is invalid', async () => {
       (auth as jest.Mock).mockResolvedValue({ userId: null });
       (prisma.userApiKey.findUnique as jest.Mock).mockResolvedValue(null);
       
       const req = new Request('http://localhost/api/v1/jobs', {
         method: 'POST',
         headers: { 'Authorization': 'Bearer invalid_key' },
         body: JSON.stringify(validBody),
       });
       
       const response = await POST(req);
       expect(response.status).toBe(401);
       // Check for specific error message if desired, e.g. "Unauthorized: Invalid API Key"
       const data = await response.json();
       expect(data.status).toBe(401); // NextResponse signature might put status in body if not standard, but here it's status code.
       // The code does: return new NextResponse("Unauthorized: Invalid API Key", { status: 401 });
    });

    it('should create job and trigger task when input is valid', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: 'user_123' });
      (prisma.job.create as jest.Mock).mockResolvedValue({ id: 'job_new' });

      const req = new Request('http://localhost/api/v1/jobs', {
        method: 'POST',
        body: JSON.stringify(validBody),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(202);
      expect(data.jobId).toBe('job_new');
      expect(tasks.trigger).toHaveBeenCalled();
    });

    it('should return 400 for invalid input', async () => {
        (auth as jest.Mock).mockResolvedValue({ userId: 'user_123' });
        
        // missing spec
        const req = new Request('http://localhost/api/v1/jobs', {
          method: 'POST',
          body: JSON.stringify({ config: {} }),
        });
  
        const response = await POST(req);
        expect(response.status).toBe(400);
    });

    it('should update job status to failed if trigger fails', async () => {
        (auth as jest.Mock).mockResolvedValue({ userId: 'user_123' });
        (prisma.job.create as jest.Mock).mockResolvedValue({ id: 'job_fail' });
        (tasks.trigger as jest.Mock).mockRejectedValue(new Error('Trigger failed'));
  
        const req = new Request('http://localhost/api/v1/jobs', {
          method: 'POST',
          body: JSON.stringify(validBody),
        });
  
        const response = await POST(req);
        // The code re-throws the error, so Next.js handles it (usually 500)
        expect(response.status).toBe(500);
        
        expect(prisma.job.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'job_fail' },
            data: expect.objectContaining({ status: 'failed' })
        }));
    });
  });
});
