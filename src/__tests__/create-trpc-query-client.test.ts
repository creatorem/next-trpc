import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { createTrpcQueryClient } from '../create-trpc-query-client';
import { endpoint, router } from '../core';
import z from 'zod';

// Helper function to create expected URL with Base64 encoding
const createExpectedUrl = (baseUrl: string, input: any) => {
  const serializedInput = JSON.stringify(input, (key, value) => {
    if (Number.isNaN(value)) {
      return '__NAN__';
    }
    return value;
  });
  const encoded = btoa(serializedInput);
  return `${baseUrl}?input=${encodeURIComponent(encoded)}`;
};

// Mock fetch
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

// Mock the client-only module
jest.mock('client-only', () => ({}));

// Mock useQuery
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

const { useQuery: mockUseQuery } = jest.requireMock('@tanstack/react-query') as { useQuery: jest.MockedFunction<any> };

describe('create-trpc-query-client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTrpcQueryClient', () => {
    it('creates client with proxy that returns fetch and useQuery functions', () => {
      const client = createTrpcQueryClient({
        url: 'http://localhost:3000/api/trpc',
        useQuery: mockUseQuery
      });

      expect(typeof (client as any).getUser.fetch).toBe('function');
      expect(typeof (client as any).getUser.useQuery).toBe('function');
      expect(typeof (client as any).getAllUsers.fetch).toBe('function');
      expect(typeof (client as any).getAllUsers.useQuery).toBe('function');
    });

    it('proxy returns undefined for non-string properties', () => {
      const client = createTrpcQueryClient({
        url: 'http://localhost:3000/api/trpc',
        useQuery: mockUseQuery
      });

      expect((client as any)[Symbol.iterator]).toBeUndefined();
      // Note: Numbers are converted to strings by Proxy, so this returns fetch/useQuery functions
      expect(typeof (client as any)[123].fetch).toBe('function');
      expect(typeof (client as any)[123].useQuery).toBe('function');
    });

    it('fetch function works correctly', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { id: '123', name: 'John' } })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const client = createTrpcQueryClient({
        url: 'http://localhost:3000/api/trpc',
        useQuery: mockUseQuery
      });

      const result = await (client as any).getUser.fetch({ id: '123' });

      expect(mockFetch).toHaveBeenCalledWith(
        createExpectedUrl('http://localhost:3000/api/trpc/get-user', { id: '123' }),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual({ id: '123', name: 'John' });
    });

    it('useQuery function calls useQuery with correct parameters', () => {
      const client = createTrpcQueryClient({
        url: 'http://localhost:3000/api/trpc',
        useQuery: mockUseQuery
      });

      const mockQueryResult = {
        data: null,
        isLoading: false,
        error: null,
        isError: false,
      };
      mockUseQuery.mockReturnValue(mockQueryResult);

      const queryOptions = {
        enabled: true,
        staleTime: 5000,
      };

      (client as any).getUserProfile.useQuery(queryOptions);

      expect(mockUseQuery).toHaveBeenCalledWith({
        enabled: true,
        staleTime: 5000,
        queryKey: ['get-user-profile'],
        queryFn: expect.any(Function),
      });
    });

    it('useQuery converts camelCase to kebab-case for queryKey', () => {
      const client = createTrpcQueryClient({
        url: 'http://localhost:3000/api/trpc',
        useQuery: mockUseQuery
      });

      mockUseQuery.mockReturnValue({});

      (client as any).getUserProfileData.useQuery();

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ['get-user-profile-data'],
        queryFn: expect.any(Function),
      });
    });

    it('useQuery handles endpoint names with consecutive uppercase letters', () => {
      const client = createTrpcQueryClient({
        url: 'http://localhost:3000/api/trpc',
        useQuery: mockUseQuery
      });

      mockUseQuery.mockReturnValue({});

      (client as any).getXMLData.useQuery();

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ['get-x-m-l-data'],
        queryFn: expect.any(Function),
      });
    });

    it('useQuery works without additional options', () => {
      const client = createTrpcQueryClient({
        url: 'http://localhost:3000/api/trpc',
        useQuery: mockUseQuery
      });

      mockUseQuery.mockReturnValue({});

      (client as any).getUsers.useQuery();

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ['get-users'],
        queryFn: expect.any(Function),
      });
    });

    it('passes headers to fetch function', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { success: true } })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const client = createTrpcQueryClient({
        url: 'http://localhost:3000/api/trpc',
        useQuery: mockUseQuery,
        headers: {
          'Authorization': 'Bearer token123'
        }
      });

      await (client as any).protectedEndpoint.fetch(undefined);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/trpc/protected-endpoint',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token123',
          },
        }
      );
    });

    it('passes function headers to fetch function', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { success: true } })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const headersFn = jest.fn().mockResolvedValue({
        'Authorization': 'Bearer dynamic-token'
      }) as () => Promise<HeadersInit>;

      const client = createTrpcQueryClient({
        url: 'http://localhost:3000/api/trpc',
        useQuery: mockUseQuery,
        headers: headersFn
      });

      await (client as any).dynamicEndpoint.fetch(undefined);

      expect(headersFn).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/trpc/dynamic-endpoint',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer dynamic-token',
          },
        }
      );
    });

    it('integrates with router type system', () => {
      const testRouter = router({
        getUser: endpoint.input(z.object({ id: z.string() })).action((input) => ({ 
          id: input.id, 
          name: 'John' 
        })),
        getAllUsers: endpoint.action(() => [{ id: '1', name: 'User1' }])
      });

      const client = createTrpcQueryClient<typeof testRouter>({
        url: 'http://localhost:3000/api/trpc',
        useQuery: mockUseQuery
      });

      expect((client as any).getUser.fetch).toBeDefined();
      expect((client as any).getUser.useQuery).toBeDefined();
      expect((client as any).getAllUsers.fetch).toBeDefined();
      expect((client as any).getAllUsers.useQuery).toBeDefined();
      expect(typeof (client as any).getUser.fetch).toBe('function');
      expect(typeof (client as any).getUser.useQuery).toBe('function');
      expect(typeof (client as any).getAllUsers.fetch).toBe('function');
      expect(typeof (client as any).getAllUsers.useQuery).toBe('function');
    });

    it('useQuery queryFn calls the correct fetch function', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { test: 'data' } })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const client = createTrpcQueryClient({
        url: 'http://localhost:3000/api/trpc',
        useQuery: mockUseQuery
      });

      let capturedQueryFn: any;
      mockUseQuery.mockImplementation(({ queryFn }: any) => {
        capturedQueryFn = queryFn;
        return {};
      });

      (client as any).testEndpoint.useQuery();

      await capturedQueryFn();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/trpc/test-endpoint',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    });

    it('preserves all useQuery options while adding queryKey and queryFn', () => {
      const client = createTrpcQueryClient({
        url: 'http://localhost:3000/api/trpc',
        useQuery: mockUseQuery
      });

      mockUseQuery.mockReturnValue({});

      const customOptions = {
        enabled: false,
        staleTime: 10000,
        cacheTime: 60000,
        refetchOnMount: false,
        refetchOnWindowFocus: true,
        retry: 3,
        retryDelay: 1000,
      };

      (client as any).customEndpoint.useQuery(customOptions);

      expect(mockUseQuery).toHaveBeenCalledWith({
        ...customOptions,
        queryKey: ['custom-endpoint'],
        queryFn: expect.any(Function),
      });
    });

    it('handles fetch errors in useQuery', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Server error' })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const client = createTrpcQueryClient({
        url: 'http://localhost:3000/api/trpc',
        useQuery: mockUseQuery
      });

      let capturedQueryFn: any;
      mockUseQuery.mockImplementation(({ queryFn }: any) => {
        capturedQueryFn = queryFn;
        return {};
      });

      (client as any).errorEndpoint.useQuery();

      await expect(capturedQueryFn()).rejects.toThrow('Server error');
    });
  });
});