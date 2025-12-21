import { describe, it, expect, jest } from '@jest/globals';
import z from 'zod';

// Helper function to create mock request with Base64 encoded input
const createMockRequest = (input: any) => {
  const serializedInput = JSON.stringify(input, (key, value) => {
    if (Number.isNaN(value)) {
      return '__NAN__';
    }
    return value;
  });
  const encoded = btoa(serializedInput);
  const searchParams = new URLSearchParams();
  searchParams.set('input', encoded);
  return { nextUrl: { searchParams } };
};

// Mock the dependencies we can't import in test environment
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, init) => ({
      data,
      status: init?.status || 200,
      json: async () => data
    }))
  }
}));

// Import after mocking
import { createTrpcAPI } from '../create-trpc-api';
import { endpoint, router } from '../core';

describe('create-trpc-api', () => {
  let mockNextResponse: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Get the mocked NextResponse
    const { NextResponse } = require('next/server');
    mockNextResponse = NextResponse;
  });

  describe('createTrpcAPI', () => {
    it('returns a handler function', () => {
      const testRouter = router({
        getUser: endpoint.action(() => ({ name: 'test' }))
      });
      
      const handler = createTrpcAPI({ router: testRouter });
      
      expect(typeof handler).toBe('function');
    });

    it('handles missing trpc param', async () => {
      const testRouter = router({
        getUser: endpoint.action(() => ({ name: 'test' }))
      });
      
      const mockRequest = { nextUrl: { searchParams: new URLSearchParams() } };
      const handler = createTrpcAPI({ router: testRouter });
      
      await handler(mockRequest as any, { params: Promise.resolve({}) });
      
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          data: null,
          error: 'You must call createAPI in a [trpc]/route.ts file.',
        },
        { status: 400 }
      );
    });

    it('handles empty trpc param', async () => {
      const testRouter = router({
        getUser: endpoint.action(() => ({ name: 'test' }))
      });
      
      const mockRequest = { nextUrl: { searchParams: new URLSearchParams() } };
      const handler = createTrpcAPI({ router: testRouter });
      
      await handler(mockRequest as any, { params: Promise.resolve({ trpc: '' }) });
      
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          data: null,
          error: 'You must pass a params in your [trpc]/you-must-put-a-param-here call',
        },
        { status: 400 }
      );
    });

    it('handles non-existent endpoint', async () => {
      const testRouter = router({
        getUser: endpoint.action(() => ({ name: 'test' }))
      });
      
      const mockRequest = { nextUrl: { searchParams: new URLSearchParams() } };
      const handler = createTrpcAPI({ router: testRouter });
      
      await handler(mockRequest as any, { params: Promise.resolve({ trpc: 'non-existent' }) });
      
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          data: null,
          error: 'No nonExistent endpoints found in the router object.',
        },
        { status: 400 }
      );
    });

    it('successfully calls endpoint without input', async () => {
      const mockAction = jest.fn().mockReturnValue({ name: 'John Doe' });
      const testRouter = router({
        getUser: endpoint.action(mockAction)
      });
      
      const mockRequest = { nextUrl: { searchParams: new URLSearchParams() } };
      const handler = createTrpcAPI({ router: testRouter });
      
      await handler(mockRequest as any, { params: Promise.resolve({ trpc: 'get-user' }) });
      
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { data: { name: 'John Doe' } },
        { status: 200 }
      );
      expect(mockAction).toHaveBeenCalledWith({ request: mockRequest });
    });

    it('successfully calls endpoint with input', async () => {
      const schema = z.object({ id: z.string() });
      const mockAction = jest.fn().mockReturnValue({ id: '123', name: 'John Doe' });
      const testRouter = router({
        getUser: endpoint.input(schema).action(mockAction)
      });
      
      const mockRequest = createMockRequest({ id: '123' });
      const handler = createTrpcAPI({ router: testRouter });
      
      await handler(mockRequest as any, { params: Promise.resolve({ trpc: 'get-user' }) });
      
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { data: { id: '123', name: 'John Doe' } },
        { status: 200 }
      );
      expect(mockAction).toHaveBeenCalledWith({ id: '123' }, { request: mockRequest });
    });

    it('handles context function', async () => {
      const mockAction = jest.fn().mockReturnValue({ user: 'authenticated' });
      const mockCtxFunction = jest.fn(() => Promise.resolve({ userId: '456', role: 'admin' }));
      const testRouter = router({
        getProfile: endpoint.action(mockAction)
      });
      
      const mockRequest = { nextUrl: { searchParams: new URLSearchParams() } };
      const handler = createTrpcAPI({ 
        router: testRouter,
        ctx: mockCtxFunction as any
      });
      
      await handler(mockRequest as any, { params: Promise.resolve({ trpc: 'get-profile' }) });
      
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { data: { user: 'authenticated' } },
        { status: 200 }
      );
      expect(mockCtxFunction).toHaveBeenCalledWith(mockRequest);
      expect(mockAction).toHaveBeenCalledWith({ userId: '456', role: 'admin', request: mockRequest });
    });

    it('handles Zod validation errors', async () => {
      const schema = z.object({ id: z.string().min(1) });
      const mockAction = jest.fn();
      const testRouter = router({
        getUser: endpoint.input(schema).action(mockAction)
      });
      
      const mockRequest = createMockRequest({ id: '' });
      const handler = createTrpcAPI({ router: testRouter });
      
      await handler(mockRequest as any, { params: Promise.resolve({ trpc: 'get-user' }) });
      
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { data: null, error: 'Invalid request data', details: expect.any(String) },
        { status: 400 }
      );
      expect(mockAction).not.toHaveBeenCalled();
    });

    it('handles general errors', async () => {
      const mockAction = jest.fn(() => Promise.reject(new Error('Something went wrong')));
      const testRouter = router({
        getUser: endpoint.action(mockAction)
      });
      
      const mockRequest = { nextUrl: { searchParams: new URLSearchParams() } };
      const handler = createTrpcAPI({ router: testRouter });
      
      await handler(mockRequest as any, { params: Promise.resolve({ trpc: 'get-user' }) });
      
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { data: null, error: 'Internal Server Error' },
        { status: 500 }
      );
    });

    it('handles kebab-case endpoint names', async () => {
      const mockAction = jest.fn().mockReturnValue({ success: true });
      const testRouter = router({
        getUserProfile: endpoint.action(mockAction)
      });
      
      const mockRequest = { nextUrl: { searchParams: new URLSearchParams() } };
      const handler = createTrpcAPI({ router: testRouter });
      
      await handler(mockRequest as any, { params: Promise.resolve({ trpc: 'get-user-profile' }) });
      
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { data: { success: true } },
        { status: 200 }
      );
      expect(mockAction).toHaveBeenCalled();
    });

    it('parses multiple query parameters', async () => {
      const schema = z.object({ 
        name: z.string(),
        age: z.string() 
      });
      const mockAction = jest.fn().mockReturnValue({ parsed: true });
      const testRouter = router({
        createUser: endpoint.input(schema).action(mockAction)
      });
      
      const mockRequest = createMockRequest({ name: 'John', age: '30' });
      const handler = createTrpcAPI({ router: testRouter });
      
      await handler(mockRequest as any, { params: Promise.resolve({ trpc: 'create-user' }) });
      
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { data: { parsed: true } },
        { status: 200 }
      );
      expect(mockAction).toHaveBeenCalledWith({ name: 'John', age: '30' }, { request: mockRequest });
    });
  });
});