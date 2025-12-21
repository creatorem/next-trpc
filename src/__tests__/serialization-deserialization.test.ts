import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { getTrpcFetch } from '../create-trpc-client';
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

// Mock fetch
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

// Mock Next.js server
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, init) => ({
      data,
      status: init?.status || 200,
      json: async () => data
    }))
  }
}));

import { createTrpcAPI } from '../create-trpc-api';
import { endpoint, router } from '../core';

describe('Serialization/Deserialization', () => {
  let mockNextResponse: any;

  beforeEach(() => {
    jest.clearAllMocks();
    const { NextResponse } = require('next/server');
    mockNextResponse = NextResponse;
  });

  describe('Array Serialization', () => {
    it('serializes string arrays correctly', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { success: true } })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const fetchFn = getTrpcFetch({
        endpointSlug: 'testEndpoint',
        url: 'http://localhost:3000/api/trpc',
      });

      await fetchFn({ contentTypes: ['booking', 'payment', 'user'] });

      expect(mockFetch).toHaveBeenCalledWith(
        createExpectedUrl('http://localhost:3000/api/trpc/test-endpoint', { contentTypes: ['booking', 'payment', 'user'] }),
        expect.any(Object)
      );
    });

    it('serializes number arrays correctly', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { success: true } })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const fetchFn = getTrpcFetch({
        endpointSlug: 'testEndpoint',
        url: 'http://localhost:3000/api/trpc',
      });

      await fetchFn({ ids: [1, 2, 3, 4, 5] });

      expect(mockFetch).toHaveBeenCalledWith(
        createExpectedUrl('http://localhost:3000/api/trpc/test-endpoint', { ids: [1, 2, 3, 4, 5] }),
        expect.any(Object)
      );
    });

    it('serializes boolean arrays correctly', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { success: true } })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const fetchFn = getTrpcFetch({
        endpointSlug: 'testEndpoint',
        url: 'http://localhost:3000/api/trpc',
      });

      await fetchFn({ flags: [true, false, true] });

      expect(mockFetch).toHaveBeenCalledWith(
        createExpectedUrl('http://localhost:3000/api/trpc/test-endpoint', { flags: [true, false, true] }),
        expect.any(Object)
      );
    });

    it('serializes mixed arrays correctly', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { success: true } })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const fetchFn = getTrpcFetch({
        endpointSlug: 'testEndpoint',
        url: 'http://localhost:3000/api/trpc',
      });

      await fetchFn({ mixed: ['string', 123, true, null] });

      expect(mockFetch).toHaveBeenCalledWith(
        createExpectedUrl('http://localhost:3000/api/trpc/test-endpoint', { mixed: ['string', 123, true, null] }),
        expect.any(Object)
      );
    });

    it('serializes empty arrays correctly', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { success: true } })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const fetchFn = getTrpcFetch({
        endpointSlug: 'testEndpoint',
        url: 'http://localhost:3000/api/trpc',
      });

      await fetchFn({ emptyArray: [] });

      expect(mockFetch).toHaveBeenCalledWith(
        createExpectedUrl('http://localhost:3000/api/trpc/test-endpoint', { emptyArray: [] }),
        expect.any(Object)
      );
    });

    it('serializes nested arrays correctly', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { success: true } })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const fetchFn = getTrpcFetch({
        endpointSlug: 'testEndpoint',
        url: 'http://localhost:3000/api/trpc',
      });

      await fetchFn({ matrix: [[1, 2], [3, 4], [5, 6]] });

      expect(mockFetch).toHaveBeenCalledWith(
        createExpectedUrl('http://localhost:3000/api/trpc/test-endpoint', { matrix: [[1, 2], [3, 4], [5, 6]] }),
        expect.any(Object)
      );
    });
  });

  describe('Object Serialization', () => {
    it('serializes simple objects correctly', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { success: true } })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const fetchFn = getTrpcFetch({
        endpointSlug: 'testEndpoint',
        url: 'http://localhost:3000/api/trpc',
      });

      await fetchFn({ where: { status: 'active', type: 'premium' } });

      expect(mockFetch).toHaveBeenCalledWith(
        createExpectedUrl('http://localhost:3000/api/trpc/test-endpoint', { where: { status: 'active', type: 'premium' } }),
        expect.any(Object)
      );
    });

    it('serializes nested objects correctly', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { success: true } })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const fetchFn = getTrpcFetch({
        endpointSlug: 'testEndpoint',
        url: 'http://localhost:3000/api/trpc',
      });

      await fetchFn({ 
        filter: { 
          user: { name: 'John', age: 30 },
          settings: { theme: 'dark', notifications: true }
        } 
      });

      expect(mockFetch).toHaveBeenCalledWith(
        createExpectedUrl('http://localhost:3000/api/trpc/test-endpoint', { 
          filter: { 
            user: { name: 'John', age: 30 },
            settings: { theme: 'dark', notifications: true }
          } 
        }),
        expect.any(Object)
      );
    });

    it('serializes objects with arrays correctly', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { success: true } })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const fetchFn = getTrpcFetch({
        endpointSlug: 'testEndpoint',
        url: 'http://localhost:3000/api/trpc',
      });

      await fetchFn({ 
        config: { 
          tags: ['urgent', 'important'],
          permissions: [1, 2, 3],
          enabled: [true, false]
        } 
      });

      expect(mockFetch).toHaveBeenCalledWith(
        createExpectedUrl('http://localhost:3000/api/trpc/test-endpoint', { 
          config: { 
            tags: ['urgent', 'important'],
            permissions: [1, 2, 3],
            enabled: [true, false]
          } 
        }),
        expect.any(Object)
      );
    });

    it('serializes empty objects correctly', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { success: true } })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const fetchFn = getTrpcFetch({
        endpointSlug: 'testEndpoint',
        url: 'http://localhost:3000/api/trpc',
      });

      await fetchFn({ emptyObj: {} });

      expect(mockFetch).toHaveBeenCalledWith(
        createExpectedUrl('http://localhost:3000/api/trpc/test-endpoint', { emptyObj: {} }),
        expect.any(Object)
      );
    });

    it('serializes objects with null and undefined values correctly', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { success: true } })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const fetchFn = getTrpcFetch({
        endpointSlug: 'testEndpoint',
        url: 'http://localhost:3000/api/trpc',
      });

      await fetchFn({ 
        data: { 
          nullValue: null,
          undefinedValue: undefined,
          falseValue: false,
          zeroValue: 0
        } 
      });

      expect(mockFetch).toHaveBeenCalledWith(
        createExpectedUrl('http://localhost:3000/api/trpc/test-endpoint', { 
          data: { 
            nullValue: null,
            falseValue: false,
            zeroValue: 0
          } 
        }),
        expect.any(Object)
      );
    });
  });

  describe('Mixed Type Serialization', () => {
    it('serializes complex mixed input correctly', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { success: true } })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const fetchFn = getTrpcFetch({
        endpointSlug: 'analyticsFetcher',
        url: 'http://localhost:3000/api/trpc',
      });

      await fetchFn({
        contentTypes: ['booking', 'payment'],
        organizationId: 'qlmskjdqslmdf',
        endDate: '03-10-2025',
        where: { status: 'active', priority: 1 },
        includeArchived: false,
        limit: 100
      });

      expect(mockFetch).toHaveBeenCalledWith(
        createExpectedUrl('http://localhost:3000/api/trpc/analytics-fetcher', {
          contentTypes: ['booking', 'payment'],
          organizationId: 'qlmskjdqslmdf',
          endDate: '03-10-2025',
          where: { status: 'active', priority: 1 },
          includeArchived: false,
          limit: 100
        }),
        expect.any(Object)
      );
    });

    it('handles arrays of objects correctly', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { success: true } })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const fetchFn = getTrpcFetch({
        endpointSlug: 'testEndpoint',
        url: 'http://localhost:3000/api/trpc',
      });

      await fetchFn({
        users: [
          { id: 1, name: 'John' },
          { id: 2, name: 'Jane' }
        ]
      });

      expect(mockFetch).toHaveBeenCalledWith(
        createExpectedUrl('http://localhost:3000/api/trpc/test-endpoint', {
          users: [
            { id: 1, name: 'John' },
            { id: 2, name: 'Jane' }
          ]
        }),
        expect.any(Object)
      );
    });

    it('preserves primitive values as strings', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { success: true } })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const fetchFn = getTrpcFetch({
        endpointSlug: 'testEndpoint',
        url: 'http://localhost:3000/api/trpc',
      });

      await fetchFn({
        stringValue: 'hello world',
        numberValue: 42,
        booleanValue: true,
        nullValue: null
      });

      expect(mockFetch).toHaveBeenCalledWith(
        createExpectedUrl('http://localhost:3000/api/trpc/test-endpoint', {
          stringValue: 'hello world',
          numberValue: 42,
          booleanValue: true,
          nullValue: null
        }),
        expect.any(Object)
      );
    });
  });

  describe('Array Deserialization', () => {
    it('deserializes string arrays correctly', async () => {
      const schema = z.object({ 
        contentTypes: z.array(z.string()) 
      });
      const mockAction = jest.fn().mockReturnValue({ success: true });
      const testRouter = router({
        testEndpoint: endpoint.input(schema).action(mockAction)
      });

      const mockRequest = createMockRequest({ contentTypes: ['booking', 'payment', 'user'] });
      const handler = createTrpcAPI({ router: testRouter });

      await handler(mockRequest as any, { params: Promise.resolve({ trpc: 'test-endpoint' }) });

      expect(mockAction).toHaveBeenCalledWith(
        { contentTypes: ['booking', 'payment', 'user'] },
        { request: mockRequest }
      );
    });

    it('deserializes number arrays correctly', async () => {
      const schema = z.object({ 
        ids: z.array(z.number()) 
      });
      const mockAction = jest.fn().mockReturnValue({ success: true });
      const testRouter = router({
        testEndpoint: endpoint.input(schema).action(mockAction)
      });

      const mockRequest = createMockRequest({ ids: [1, 2, 3, 4, 5] });
      const handler = createTrpcAPI({ router: testRouter });

      await handler(mockRequest as any, { params: Promise.resolve({ trpc: 'test-endpoint' }) });

      expect(mockAction).toHaveBeenCalledWith(
        { ids: [1, 2, 3, 4, 5] },
        { request: mockRequest }
      );
    });

    it('deserializes boolean arrays correctly', async () => {
      const schema = z.object({ 
        flags: z.array(z.boolean()) 
      });
      const mockAction = jest.fn().mockReturnValue({ success: true });
      const testRouter = router({
        testEndpoint: endpoint.input(schema).action(mockAction)
      });

      const mockRequest = createMockRequest({ flags: [true, false, true] });
      const handler = createTrpcAPI({ router: testRouter });

      await handler(mockRequest as any, { params: Promise.resolve({ trpc: 'test-endpoint' }) });

      expect(mockAction).toHaveBeenCalledWith(
        { flags: [true, false, true] },
        { request: mockRequest }
      );
    });

    it('deserializes empty arrays correctly', async () => {
      const schema = z.object({ 
        emptyArray: z.array(z.string()) 
      });
      const mockAction = jest.fn().mockReturnValue({ success: true });
      const testRouter = router({
        testEndpoint: endpoint.input(schema).action(mockAction)
      });

      const mockRequest = createMockRequest({ emptyArray: [] });
      const handler = createTrpcAPI({ router: testRouter });

      await handler(mockRequest as any, { params: Promise.resolve({ trpc: 'test-endpoint' }) });

      expect(mockAction).toHaveBeenCalledWith(
        { emptyArray: [] },
        { request: mockRequest }
      );
    });

    it('deserializes nested arrays correctly', async () => {
      const schema = z.object({ 
        matrix: z.array(z.array(z.number())) 
      });
      const mockAction = jest.fn().mockReturnValue({ success: true });
      const testRouter = router({
        testEndpoint: endpoint.input(schema).action(mockAction)
      });

      const mockRequest = createMockRequest({ matrix: [[1, 2], [3, 4], [5, 6]] });
      const handler = createTrpcAPI({ router: testRouter });

      await handler(mockRequest as any, { params: Promise.resolve({ trpc: 'test-endpoint' }) });

      expect(mockAction).toHaveBeenCalledWith(
        { matrix: [[1, 2], [3, 4], [5, 6]] },
        { request: mockRequest }
      );
    });
  });

  describe('Object Deserialization', () => {
    it('deserializes simple objects correctly', async () => {
      const schema = z.object({ 
        where: z.object({ 
          status: z.string(),
          type: z.string() 
        }) 
      });
      const mockAction = jest.fn().mockReturnValue({ success: true });
      const testRouter = router({
        testEndpoint: endpoint.input(schema).action(mockAction)
      });

      const mockRequest = createMockRequest({ where: { status: 'active', type: 'premium' } });
      const handler = createTrpcAPI({ router: testRouter });

      await handler(mockRequest as any, { params: Promise.resolve({ trpc: 'test-endpoint' }) });

      expect(mockAction).toHaveBeenCalledWith(
        { where: { status: 'active', type: 'premium' } },
        { request: mockRequest }
      );
    });

    it('deserializes nested objects correctly', async () => {
      const schema = z.object({ 
        filter: z.object({
          user: z.object({
            name: z.string(),
            age: z.number()
          }),
          settings: z.object({
            theme: z.string(),
            notifications: z.boolean()
          })
        })
      });
      const mockAction = jest.fn().mockReturnValue({ success: true });
      const testRouter = router({
        testEndpoint: endpoint.input(schema).action(mockAction)
      });

      const mockRequest = createMockRequest({ 
        filter: { 
          user: { name: 'John', age: 30 },
          settings: { theme: 'dark', notifications: true }
        }
      });
      const handler = createTrpcAPI({ router: testRouter });

      await handler(mockRequest as any, { params: Promise.resolve({ trpc: 'test-endpoint' }) });

      expect(mockAction).toHaveBeenCalledWith(
        { filter: { 
          user: { name: 'John', age: 30 },
          settings: { theme: 'dark', notifications: true }
        }},
        { request: mockRequest }
      );
    });

    it('deserializes empty objects correctly', async () => {
      const schema = z.object({ 
        emptyObj: z.object({}) 
      });
      const mockAction = jest.fn().mockReturnValue({ success: true });
      const testRouter = router({
        testEndpoint: endpoint.input(schema).action(mockAction)
      });

      const mockRequest = createMockRequest({ emptyObj: {} });
      const handler = createTrpcAPI({ router: testRouter });

      await handler(mockRequest as any, { params: Promise.resolve({ trpc: 'test-endpoint' }) });

      expect(mockAction).toHaveBeenCalledWith(
        { emptyObj: {} },
        { request: mockRequest }
      );
    });
  });

  describe('Mixed Type Deserialization', () => {
    it('deserializes complex mixed input correctly', async () => {
      const schema = z.object({
        contentTypes: z.array(z.string()),
        organizationId: z.string(),
        endDate: z.string(),
        where: z.object({
          status: z.string(),
          priority: z.number()
        }),
        includeArchived: z.boolean(),
        limit: z.coerce.number()
      });
      const mockAction = jest.fn().mockReturnValue({ success: true });
      const testRouter = router({
        analyticsFetcher: endpoint.input(schema).action(mockAction)
      });

      const mockRequest = createMockRequest({
        contentTypes: ['booking', 'payment'],
        organizationId: 'qlmskjdqslmdf',
        endDate: '03-10-2025',
        where: { status: 'active', priority: 1 },
        includeArchived: false,
        limit: 100
      });
      const handler = createTrpcAPI({ router: testRouter });

      await handler(mockRequest as any, { params: Promise.resolve({ trpc: 'analytics-fetcher' }) });

      expect(mockAction).toHaveBeenCalledWith(
        {
          contentTypes: ['booking', 'payment'],
          organizationId: 'qlmskjdqslmdf',
          endDate: '03-10-2025',
          where: { status: 'active', priority: 1 },
          includeArchived: false,
          limit: 100
        },
        { request: mockRequest }
      );
    });

    it('handles arrays of objects correctly in deserialization', async () => {
      const schema = z.object({
        users: z.array(z.object({
          id: z.number(),
          name: z.string()
        }))
      });
      const mockAction = jest.fn().mockReturnValue({ success: true });
      const testRouter = router({
        testEndpoint: endpoint.input(schema).action(mockAction)
      });

      const mockRequest = createMockRequest({
        users: [
          { id: 1, name: 'John' },
          { id: 2, name: 'Jane' }
        ]
      });
      const handler = createTrpcAPI({ router: testRouter });

      await handler(mockRequest as any, { params: Promise.resolve({ trpc: 'test-endpoint' }) });

      expect(mockAction).toHaveBeenCalledWith(
        {
          users: [
            { id: 1, name: 'John' },
            { id: 2, name: 'Jane' }
          ]
        },
        { request: mockRequest }
      );
    });

    it('handles all data types correctly with Base64 encoding', async () => {
      const schema = z.object({
        array: z.array(z.string()),
        string: z.string()
      });
      const mockAction = jest.fn().mockReturnValue({ success: true });
      const testRouter = router({
        testEndpoint: endpoint.input(schema).action(mockAction)
      });

      const mockRequest = createMockRequest({
        array: ['valid', 'array'],
        string: 'simple-string'
      });
      const handler = createTrpcAPI({ router: testRouter });

      await handler(mockRequest as any, { params: Promise.resolve({ trpc: 'test-endpoint' }) });

      expect(mockAction).toHaveBeenCalledWith(
        {
          array: ['valid', 'array'],
          string: 'simple-string'
        },
        { request: mockRequest }
      );
    });
  });

  describe('Edge Cases', () => {
    it('handles null values correctly', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { success: true } })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const fetchFn = getTrpcFetch({
        endpointSlug: 'testEndpoint',
        url: 'http://localhost:3000/api/trpc',
      });

      await fetchFn({ nullValue: null });

      expect(mockFetch).toHaveBeenCalledWith(
        createExpectedUrl('http://localhost:3000/api/trpc/test-endpoint', { nullValue: null }),
        expect.any(Object)
      );
    });

    it('serializes boolean values correctly', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { success: true } })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const fetchFn = getTrpcFetch({
        endpointSlug: 'testEndpoint',
        url: 'http://localhost:3000/api/trpc',
      });

      await fetchFn({ 
        trueValue: true, 
        falseValue: false 
      });

      expect(mockFetch).toHaveBeenCalledWith(
        createExpectedUrl('http://localhost:3000/api/trpc/test-endpoint', { 
          trueValue: true, 
          falseValue: false 
        }),
        expect.any(Object)
      );
    });

    it('serializes NaN values correctly', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { success: true } })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const fetchFn = getTrpcFetch({
        endpointSlug: 'testEndpoint',
        url: 'http://localhost:3000/api/trpc',
      });

      await fetchFn({ nanValue: NaN });

      expect(mockFetch).toHaveBeenCalledWith(
        createExpectedUrl('http://localhost:3000/api/trpc/test-endpoint', { nanValue: NaN }),
        expect.any(Object)
      );
    });

    it('deserializes boolean values correctly', async () => {
      const schema = z.object({
        trueValue: z.boolean(),
        falseValue: z.boolean()
      });
      const mockAction = jest.fn().mockReturnValue({ success: true });
      const testRouter = router({
        testEndpoint: endpoint.input(schema).action(mockAction)
      });

      const mockRequest = createMockRequest({
        trueValue: true,
        falseValue: false
      });
      const handler = createTrpcAPI({ router: testRouter });

      await handler(mockRequest as any, { params: Promise.resolve({ trpc: 'test-endpoint' }) });

      expect(mockAction).toHaveBeenCalledWith(
        {
          trueValue: true,
          falseValue: false
        },
        { request: mockRequest }
      );
    });

    it('deserializes null values correctly', async () => {
      const schema = z.object({
        nullValue: z.null()
      });
      const mockAction = jest.fn().mockReturnValue({ success: true });
      const testRouter = router({
        testEndpoint: endpoint.input(schema).action(mockAction)
      });

      const mockRequest = createMockRequest({ nullValue: null });
      const handler = createTrpcAPI({ router: testRouter });

      await handler(mockRequest as any, { params: Promise.resolve({ trpc: 'test-endpoint' }) });

      expect(mockAction).toHaveBeenCalledWith(
        { nullValue: null },
        { request: mockRequest }
      );
    });

    it('deserializes NaN values correctly', async () => {
      const schema = z.object({
        nanValue: z.any() // Use z.any() because Zod doesn't consider NaN as a valid number
      });
      const mockAction = jest.fn().mockReturnValue({ success: true });
      const testRouter = router({
        testEndpoint: endpoint.input(schema).action(mockAction)
      });

      const mockRequest = createMockRequest({ nanValue: NaN });
      const handler = createTrpcAPI({ router: testRouter });

      await handler(mockRequest as any, { params: Promise.resolve({ trpc: 'test-endpoint' }) });

      expect(mockAction).toHaveBeenCalledWith(
        { nanValue: NaN }, // NaN is now preserved with custom serialization
        { request: mockRequest }
      );
    });

    it('handles JSON parsing fallback correctly', async () => {
      const schema = z.object({
        validJson: z.array(z.string()),
        invalidJson: z.string()
      });
      const mockAction = jest.fn().mockReturnValue({ success: true });
      const testRouter = router({
        testEndpoint: endpoint.input(schema).action(mockAction)
      });

      const mockRequest = createMockRequest({
        validJson: ['valid', 'array'],
        invalidJson: 'plain-string-not-json'
      });
      const handler = createTrpcAPI({ router: testRouter });

      await handler(mockRequest as any, { params: Promise.resolve({ trpc: 'test-endpoint' }) });

      expect(mockAction).toHaveBeenCalledWith(
        {
          validJson: ['valid', 'array'],
          invalidJson: 'plain-string-not-json'
        },
        { request: mockRequest }
      );
    });

    it('correctly parses JSON primitives vs preserves string primitives', async () => {
      const schema = z.object({
        stringId: z.string(),
        stringAge: z.string(),
        boolValue: z.boolean(), // Now expects actual boolean
        nullValue: z.null(), // Now expects actual null
        arrayData: z.array(z.string()),
        objectData: z.object({ key: z.string() })
      });
      const mockAction = jest.fn().mockReturnValue({ success: true });
      const testRouter = router({
        testEndpoint: endpoint.input(schema).action(mockAction)
      });

      const mockRequest = createMockRequest({
        stringId: '123',
        stringAge: '30',
        boolValue: true,
        nullValue: null,
        arrayData: ['item1', 'item2'],
        objectData: { key: 'value' }
      });
      const handler = createTrpcAPI({ router: testRouter });

      await handler(mockRequest as any, { params: Promise.resolve({ trpc: 'test-endpoint' }) });

      expect(mockAction).toHaveBeenCalledWith(
        {
          stringId: '123', // String, not number 123
          stringAge: '30', // String, not number 30
          boolValue: true, // Boolean parsed from JSON
          nullValue: null, // Null parsed from JSON
          arrayData: ['item1', 'item2'], // Parsed array
          objectData: { key: 'value' } // Parsed object
        },
        { request: mockRequest }
      );
    });

    it('handles very large objects and arrays', async () => {
      const largeArray = Array(1000).fill(0).map((_, i) => ({ id: i, name: `Item ${i}` }));
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { success: true } })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const fetchFn = getTrpcFetch({
        endpointSlug: 'testEndpoint',
        url: 'http://localhost:3000/api/trpc',
      });

      await fetchFn({ largeData: largeArray });

      expect(mockFetch).toHaveBeenCalledWith(
        createExpectedUrl('http://localhost:3000/api/trpc/test-endpoint', { largeData: largeArray }),
        expect.any(Object)
      );
    });

    it('handles deeply nested structures', async () => {
      const deepObject = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  data: ['deeply', 'nested', 'array'],
                  value: 42
                }
              }
            }
          }
        }
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { success: true } })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const fetchFn = getTrpcFetch({
        endpointSlug: 'testEndpoint',
        url: 'http://localhost:3000/api/trpc',
      });

      await fetchFn({ deepData: deepObject });

      expect(mockFetch).toHaveBeenCalledWith(
        createExpectedUrl('http://localhost:3000/api/trpc/test-endpoint', { deepData: deepObject }),
        expect.any(Object)
      );
    });

    it('round-trip serialization/deserialization maintains data integrity', async () => {
      const originalData = {
        strings: ['hello', 'world'],
        numbers: [1, 2, 3],
        booleans: [true, false],
        object: { nested: { value: 42 } },
        mixed: ['string', 123, true, { key: 'value' }]
      };

      const schema = z.object({
        strings: z.array(z.string()),
        numbers: z.array(z.number()),
        booleans: z.array(z.boolean()),
        object: z.object({
          nested: z.object({
            value: z.number()
          })
        }),
        mixed: z.array(z.any())
      });

      let deserializedData: any;
      const mockAction = jest.fn().mockImplementation((input) => {
        deserializedData = input;
        return { success: true };
      });

      const testRouter = router({
        testEndpoint: endpoint.input(schema).action(mockAction)
      });

      // Simulate serialization/deserialization with Base64 approach
      const mockRequest = createMockRequest(originalData);
      const handler = createTrpcAPI({ router: testRouter });

      await handler(mockRequest as any, { params: Promise.resolve({ trpc: 'test-endpoint' }) });

      expect(deserializedData).toEqual(originalData);
    });

    it('round-trip serialization/deserialization for special primitives', async () => {
      const originalData = {
        nullValue: null,
        trueValue: true,
        falseValue: false,
        // Note: NaN becomes null after JSON serialization, so we test that behavior
        normalNumber: 42
      };

      const schema = z.object({
        nullValue: z.null(),
        trueValue: z.boolean(), 
        falseValue: z.boolean(),
        normalNumber: z.coerce.number()
      });

      let deserializedData: any;
      const mockAction = jest.fn().mockImplementation((input) => {
        deserializedData = input;
        return { success: true };
      });

      const testRouter = router({
        testEndpoint: endpoint.input(schema).action(mockAction)
      });

      // Simulate serialization/deserialization with Base64 approach
      const mockRequest = createMockRequest(originalData);
      const handler = createTrpcAPI({ router: testRouter });

      await handler(mockRequest as any, { params: Promise.resolve({ trpc: 'test-endpoint' }) });

      expect(deserializedData).toEqual({
        nullValue: null,
        trueValue: true,
        falseValue: false,
        normalNumber: 42
      });
    });
  });
});