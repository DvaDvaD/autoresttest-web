
import { POST } from '@/app/api/v1/ci-setup/route';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { Octokit } from '@octokit/rest';

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
  clerkClient: jest.fn(),
}));

jest.mock('@octokit/rest', () => {
  const mockOctokit = {
    request: jest.fn(),
    repos: {
      getContent: jest.fn(),
      createOrUpdateFileContents: jest.fn(),
    },
  };
  return {
    Octokit: jest.fn(() => mockOctokit),
  };
});

describe('ci-setup/route.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validBody = {
    repository: 'owner/repo',
    specPath: 'openapi.yaml',
    apiKeyName: 'ART_API_KEY',
    baseUrl: 'http://example.com', // Part of ...config
    testLevel: 'sanity', // config
  };

  it('should return 401 if not authenticated', async () => {
    jest.mocked(auth).mockResolvedValue({ userId: null } as any);
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify(validBody) });
    const response = await POST(req);
    expect(response.status).toBe(401);
  });

  it('should return 400 for invalid input', async () => {
    jest.mocked(auth).mockResolvedValue({ userId: 'user_1' } as any);
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({}) });
    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it('should create workflow file successfully', async () => {
    jest.mocked(auth).mockResolvedValue({ userId: 'user_1' } as any);
    
    const mockClerk = {
        users: {
            getUserOauthAccessToken: jest.fn().mockResolvedValue({ data: [{ token: 'gh_token' }] })
        }
    };
    jest.mocked(clerkClient).mockResolvedValue(mockClerk as any);

    const mockOctokit = new Octokit(); // This will be the mock instance
    // Mock user request
    jest.mocked(mockOctokit.request).mockResolvedValueOnce({ data: { login: 'gh_user' } } as any);
    // Mock scopes request
    jest.mocked(mockOctokit.request).mockResolvedValueOnce({ headers: { 'x-oauth-scopes': 'repo' } } as any);
    
    // Mock get content (file not found)
    jest.mocked(mockOctokit.repos.getContent).mockRejectedValue({ status: 404 });
    
    jest.mocked(mockOctokit.repos.createOrUpdateFileContents).mockResolvedValue({} as any);

    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify(validBody) });
    const response = await POST(req);
    
    expect(response.status).toBe(200);
    expect(mockOctokit.repos.createOrUpdateFileContents).toHaveBeenCalledWith(expect.objectContaining({
        owner: 'owner',
        repo: 'repo',
        path: '.github/workflows/autoresttest.yml',
    }));
  });
  
  it('should handle missing github token', async () => {
      jest.mocked(auth).mockResolvedValue({ userId: 'user_1' } as any);
      const mockClerk = {
          users: {
              getUserOauthAccessToken: jest.fn().mockResolvedValue({ data: [] })
          }
      };
      jest.mocked(clerkClient).mockResolvedValue(mockClerk as any);
  
      const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify(validBody) });
      const response = await POST(req);
      
      expect(response.status).toBe(400);
  });

  it('should return 404 if repository not found (createOrUpdate throws 404)', async () => {
    jest.mocked(auth).mockResolvedValue({ userId: 'user_1' } as any);
    const mockClerk = { users: { getUserOauthAccessToken: jest.fn().mockResolvedValue({ data: [{ token: 'gh_token' }] }) } };
    jest.mocked(clerkClient).mockResolvedValue(mockClerk as any);

    const mockOctokit = new Octokit();
    jest.mocked(mockOctokit.request).mockResolvedValueOnce({ data: { login: 'gh_user' } } as any);
    jest.mocked(mockOctokit.request).mockResolvedValueOnce({ headers: { 'x-oauth-scopes': 'repo' } } as any);
    
    // Simulate getContent error (404) -> safe to proceed
    jest.mocked(mockOctokit.repos.getContent).mockRejectedValue({ status: 404 });
    
    // Simulate createOrUpdateFileContents error (404 - Repo not found)
    const error404 = new Error('Not Found');
    // @ts-ignore
    error404.status = 404;
    jest.mocked(mockOctokit.repos.createOrUpdateFileContents).mockRejectedValue(error404);

    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify(validBody) });
    const response = await POST(req);
    
    expect(response.status).toBe(404);
  });

  it('should return 500 on generic GitHub error', async () => {
    jest.mocked(auth).mockResolvedValue({ userId: 'user_1' } as any);
    const mockClerk = { users: { getUserOauthAccessToken: jest.fn().mockResolvedValue({ data: [{ token: 'gh_token' }] }) } };
    jest.mocked(clerkClient).mockResolvedValue(mockClerk as any);

    const mockOctokit = new Octokit();
    jest.mocked(mockOctokit.request).mockResolvedValueOnce({ data: { login: 'gh_user' } } as any);
    jest.mocked(mockOctokit.request).mockResolvedValueOnce({ headers: { 'x-oauth-scopes': 'repo' } } as any);
    
    // Simulate generic error during getContent
    jest.mocked(mockOctokit.repos.getContent).mockRejectedValue(new Error('GitHub Down'));
    
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify(validBody) });
    const response = await POST(req);
    
    expect(response.status).toBe(500);
  });
});
