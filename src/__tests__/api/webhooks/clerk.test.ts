
import { POST } from '@/app/api/webhooks/clerk/route';
import { prisma } from '@/lib/prisma';
import { Webhook } from 'svix';
import { headers } from 'next/headers';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      upsert: jest.fn(),
    },
  },
}));

jest.mock('svix', () => ({
  Webhook: jest.fn(),
}));

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

describe('webhooks/clerk/route.ts', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...ORIGINAL_ENV, CLERK_WEBHOOK_SECRET: 'whsec_test' };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('should throw error if CLERK_WEBHOOK_SECRET is missing', async () => {
    delete process.env.CLERK_WEBHOOK_SECRET;
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({}) });
    await expect(POST(req)).rejects.toThrow('CLERK_WEBHOOK_SECRET');
  });

  it('should return 400 if svix headers are missing', async () => {
    const mockHeaders = new Headers();
    (headers as jest.Mock).mockResolvedValue(mockHeaders);
    
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({}) });
    const response = await POST(req);
    expect(response.status).toBe(400);
    // expect(await response.text()).toContain('Missing Svix headers');
  });

  it('should return 400 if verification fails', async () => {
    const mockHeaders = new Headers({
        'svix-id': 'id',
        'svix-timestamp': 'timestamp',
        'svix-signature': 'signature',
    });
    (headers as jest.Mock).mockResolvedValue(mockHeaders);

    const mockVerify = jest.fn().mockImplementation(() => {
        throw new Error('Invalid signature');
    });
    (Webhook as unknown as jest.Mock).mockImplementation(() => ({
        verify: mockVerify
    }));

    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({}) });
    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it('should update user on user.created event', async () => {
    const mockHeaders = new Headers({
        'svix-id': 'id',
        'svix-timestamp': 'timestamp',
        'svix-signature': 'signature',
    });
    (headers as jest.Mock).mockResolvedValue(mockHeaders);

    const payload = {
        type: 'user.created',
        data: {
            id: 'user_1',
            email_addresses: [{ id: 'e_1', email_address: 'test@example.com' }],
        },
    };

    (Webhook as unknown as jest.Mock).mockImplementation(() => ({
        verify: jest.fn().mockReturnValue(payload),
    }));

    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify(payload) });
    const response = await POST(req);
    expect(response.status).toBe(200);

    expect(prisma.user.upsert).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'user_1' },
        create: { id: 'user_1', email: 'test@example.com' },
    }));
  });

  it('should ignore other event types', async () => {
    const mockHeaders = new Headers({
        'svix-id': 'id',
        'svix-timestamp': 'timestamp',
        'svix-signature': 'signature',
    });
    (headers as jest.Mock).mockResolvedValue(mockHeaders);

    const payload = {
        type: 'session.created', // Ignored event
        data: { id: 'sess_1' },
    };

    (Webhook as unknown as jest.Mock).mockImplementation(() => ({
        verify: jest.fn().mockReturnValue(payload),
    }));

    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify(payload) });
    const response = await POST(req);
    expect(response.status).toBe(200);

    expect(prisma.user.upsert).not.toHaveBeenCalled();
  });
});
