import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { createTrpcClient, getTrpcFetch } from '../create-trpc-client';
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

describe('create-trpc-client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getTrpcFetch', () => {
    it('makes GET request with correct URL for endpoint without input', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { message: 'success' } })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const fetchFn = getTrpcFetch({
        endpointSlug: 'getUsers',
        url: 'http://localhost:3000/api/trpc',
      });

      const result = await fetchFn();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/trpc/get-users',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual({ message: 'success' });
    });

    it('makes GET request with query parameters for endpoint with input', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { id: '123', name: 'John' } })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const fetchFn = getTrpcFetch({
        endpointSlug: 'getUser',
        url: 'http://localhost:3000/api/trpc',
      });

      const result = await fetchFn({ id: '123', active: true });

      expect(mockFetch).toHaveBeenCalledWith(
        createExpectedUrl('http://localhost:3000/api/trpc/get-user', { id: '123', active: true }),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual({ id: '123', name: 'John' });
    });

    it('handles static headers', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { success: true } })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const fetchFn = getTrpcFetch({
        endpointSlug: 'protectedEndpoint',
        url: 'http://localhost:3000/api/trpc',
        headers: {
          'Authorization': 'Bearer token123',
          'X-Custom-Header': 'custom-value'
        }
      });

      await fetchFn();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/trpc/protected-endpoint',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token123',
            'X-Custom-Header': 'custom-value',
          },
        }
      );
    });

    it('handles function headers', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { success: true } })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const headersFn = jest.fn(() => Promise.resolve({
        'Authorization': 'Bearer dynamic-token',
        'X-Request-ID': '12345'
      })) as () => Promise<HeadersInit>;

      const fetchFn = getTrpcFetch({
        endpointSlug: 'dynamicEndpoint',
        url: 'http://localhost:3000/api/trpc',
        headers: headersFn
      });

      await fetchFn();

      expect(headersFn).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/trpc/dynamic-endpoint',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer dynamic-token',
            'X-Request-ID': '12345',
          },
        }
      );
    });

    it('converts endpoint names to kebab-case', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: {} })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const fetchFn = getTrpcFetch({
        endpointSlug: 'getUserProfile',
        url: 'http://localhost:3000/api/trpc',
      });

      await fetchFn();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/trpc/get-user-profile',
        expect.any(Object)
      );
    });

    it('throws error on failed response', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Not found', data: null })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const fetchFn = getTrpcFetch({
        endpointSlug: 'nonExistent',
        url: 'http://localhost:3000/api/trpc',
      });

      await expect(fetchFn()).rejects.toThrow('Not found');
    });

    it('throws generic error when no error message in response', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ data: null })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const fetchFn = getTrpcFetch({
        endpointSlug: 'failing',
        url: 'http://localhost:3000/api/trpc',
      });

      await expect(fetchFn()).rejects.toThrow('Request failed');
    });

    it('handles complex input objects', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { created: true } })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const fetchFn = getTrpcFetch({
        endpointSlug: 'createUser',
        url: 'http://localhost:3000/api/trpc',
      });

      const complexInput = {
        name: 'John Doe',
        age: 30,
        active: true,
        metadata: { key: 'value' }
      };

      await fetchFn(complexInput);

      expect(mockFetch).toHaveBeenCalledWith(
        createExpectedUrl('http://localhost:3000/api/trpc/create-user', complexInput),
        expect.any(Object)
      );
    });
  });

  describe('createTrpcClient', () => {
    it('creates client with proxy that returns fetch functions', () => {
      const client = createTrpcClient({
        url: 'http://localhost:3000/api/trpc'
      });

      expect(typeof (client as any).getUser.fetch).toBe('function');
      expect(typeof (client as any).getAllUsers.fetch).toBe('function');
      expect(typeof (client as any).anyEndpoint.fetch).toBe('function');
    });

    it('proxy returns undefined for non-string properties', () => {
      const client = createTrpcClient({
        url: 'http://localhost:3000/api/trpc'
      });

      expect((client as any)[Symbol.iterator]).toBeUndefined();
      // Note: Numbers are converted to strings by Proxy, so this returns a fetch function
      expect(typeof (client as any)[123].fetch).toBe('function');
    });

    it('integrates with router type system', () => {
      const testRouter = router({
        getUser: endpoint.input(z.object({ id: z.string() })).action((input) => ({ 
          id: input.id, 
          name: 'John' 
        })),
        getAllUsers: endpoint.action(() => [{ id: '1', name: 'User1' }])
      });

      const client = createTrpcClient<typeof testRouter>({
        url: 'http://localhost:3000/api/trpc'
      });

      // These should be available due to typing
      expect((client as any).getUser.fetch).toBeDefined();
      expect((client as any).getAllUsers.fetch).toBeDefined();
      expect(typeof (client as any).getUser.fetch).toBe('function');
      expect(typeof (client as any).getAllUsers.fetch).toBe('function');
    });

    it('passes options correctly to getTrpcFetch', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { test: true } })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const client = createTrpcClient({
        url: 'http://localhost:3000/api/trpc',
        headers: { 'Authorization': 'Bearer test123' }
      });

      await (client as any).testEndpoint.fetch();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/trpc/test-endpoint',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test123',
          },
        }
      );
    });

    it('handles endpoint calls with and without parameters', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { result: true } })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const client = createTrpcClient({
        url: 'http://localhost:3000/api/trpc'
      });

      // Call without parameters
      await (client as any).noParams.fetch();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/trpc/no-params',
        expect.any(Object)
      );

      mockFetch.mockClear();

      // Call with parameters
      await (client as any).withParams.fetch({ id: '123' });
      expect(mockFetch).toHaveBeenCalledWith(
        createExpectedUrl('http://localhost:3000/api/trpc/with-params', { id: '123' }),
        expect.any(Object)
      );
    });
  });
});