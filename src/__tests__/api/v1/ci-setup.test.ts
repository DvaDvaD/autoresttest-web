
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
    (auth as jest.Mock).mockResolvedValue({ userId: null });
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify(validBody) });
    const response = await POST(req);
    expect(response.status).toBe(401);
  });

  it('should return 400 for invalid input', async () => {
    (auth as jest.Mock).mockResolvedValue({ userId: 'user_1' });
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({}) });
    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it('should create workflow file successfully', async () => {
    (auth as jest.Mock).mockResolvedValue({ userId: 'user_1' });
    
    const mockClerk = {
        users: {
            getUserOauthAccessToken: jest.fn().mockResolvedValue({ data: [{ token: 'gh_token' }] })
        }
    };
    (clerkClient as jest.Mock).mockResolvedValue(mockClerk);

    const mockOctokit = new Octokit(); // This will be the mock instance
    // Mock user request
    (mockOctokit.request as jest.Mock).mockResolvedValueOnce({ data: { login: 'gh_user' } });
    // Mock scopes request
    (mockOctokit.request as jest.Mock).mockResolvedValueOnce({ headers: { 'x-oauth-scopes': 'repo' } });
    
    // Mock get content (file not found)
    (mockOctokit.repos.getContent as jest.Mock).mockRejectedValue({ status: 404 });
    
    (mockOctokit.repos.createOrUpdateFileContents as jest.Mock).mockResolvedValue({});

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
      (auth as jest.Mock).mockResolvedValue({ userId: 'user_1' });
      const mockClerk = {
          users: {
              getUserOauthAccessToken: jest.fn().mockResolvedValue({ data: [] })
          }
      };
      (clerkClient as jest.Mock).mockResolvedValue(mockClerk);
  
      const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify(validBody) });
      const response = await POST(req);
      
      expect(response.status).toBe(400);
  });

  it('should return 404 if repository not found (createOrUpdate throws 404)', async () => {
    (auth as jest.Mock).mockResolvedValue({ userId: 'user_1' });
    const mockClerk = { users: { getUserOauthAccessToken: jest.fn().mockResolvedValue({ data: [{ token: 'gh_token' }] }) } };
    (clerkClient as jest.Mock).mockResolvedValue(mockClerk);

    const mockOctokit = new Octokit();
    (mockOctokit.request as jest.Mock).mockResolvedValueOnce({ data: { login: 'gh_user' } });
    (mockOctokit.request as jest.Mock).mockResolvedValueOnce({ headers: { 'x-oauth-scopes': 'repo' } });
    
    // Simulate getContent error (404) -> safe to proceed
    (mockOctokit.repos.getContent as jest.Mock).mockRejectedValue({ status: 404 });
    
    // Simulate createOrUpdateFileContents error (404 - Repo not found)
    const error404 = new Error('Not Found');
    // @ts-ignore
    error404.status = 404;
    (mockOctokit.repos.createOrUpdateFileContents as jest.Mock).mockRejectedValue(error404);

    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify(validBody) });
    const response = await POST(req);
    
    expect(response.status).toBe(404);
  });

  it('should return 500 on generic GitHub error', async () => {
    (auth as jest.Mock).mockResolvedValue({ userId: 'user_1' });
    const mockClerk = { users: { getUserOauthAccessToken: jest.fn().mockResolvedValue({ data: [{ token: 'gh_token' }] }) } };
    (clerkClient as jest.Mock).mockResolvedValue(mockClerk);

    const mockOctokit = new Octokit();
    (mockOctokit.request as jest.Mock).mockResolvedValueOnce({ data: { login: 'gh_user' } });
    (mockOctokit.request as jest.Mock).mockResolvedValueOnce({ headers: { 'x-oauth-scopes': 'repo' } });
    
    // Simulate generic error during getContent
    (mockOctokit.repos.getContent as jest.Mock).mockRejectedValue(new Error('GitHub Down'));
    
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify(validBody) });
    const response = await POST(req);
    
    expect(response.status).toBe(500);
  });
});
