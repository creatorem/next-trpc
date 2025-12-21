import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { getTrpcFetch } from '../create-trpc-client';
import z from 'zod';

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
        'http://localhost:3000/api/trpc/test-endpoint?contentTypes=%5B%22booking%22%2C%22payment%22%2C%22user%22%5D',
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
        'http://localhost:3000/api/trpc/test-endpoint?ids=%5B1%2C2%2C3%2C4%2C5%5D',
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
        'http://localhost:3000/api/trpc/test-endpoint?flags=%5Btrue%2Cfalse%2Ctrue%5D',
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
        'http://localhost:3000/api/trpc/test-endpoint?mixed=%5B%22string%22%2C123%2Ctrue%2Cnull%5D',
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
        'http://localhost:3000/api/trpc/test-endpoint?emptyArray=%5B%5D',
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
        'http://localhost:3000/api/trpc/test-endpoint?matrix=%5B%5B1%2C2%5D%2C%5B3%2C4%5D%2C%5B5%2C6%5D%5D',
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
        'http://localhost:3000/api/trpc/test-endpoint?where=%7B%22status%22%3A%22active%22%2C%22type%22%3A%22premium%22%7D',
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
        'http://localhost:3000/api/trpc/test-endpoint?filter=%7B%22user%22%3A%7B%22name%22%3A%22John%22%2C%22age%22%3A30%7D%2C%22settings%22%3A%7B%22theme%22%3A%22dark%22%2C%22notifications%22%3Atrue%7D%7D',
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
        'http://localhost:3000/api/trpc/test-endpoint?config=%7B%22tags%22%3A%5B%22urgent%22%2C%22important%22%5D%2C%22permissions%22%3A%5B1%2C2%2C3%5D%2C%22enabled%22%3A%5Btrue%2Cfalse%5D%7D',
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
        'http://localhost:3000/api/trpc/test-endpoint?emptyObj=%7B%7D',
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
        'http://localhost:3000/api/trpc/test-endpoint?data=%7B%22nullValue%22%3Anull%2C%22falseValue%22%3Afalse%2C%22zeroValue%22%3A0%7D',
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

      const expectedUrl = 'http://localhost:3000/api/trpc/analytics-fetcher?contentTypes=%5B%22booking%22%2C%22payment%22%5D&organizationId=qlmskjdqslmdf&endDate=03-10-2025&where=%7B%22status%22%3A%22active%22%2C%22priority%22%3A1%7D&includeArchived=false&limit=100';
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl, expect.any(Object));
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
        'http://localhost:3000/api/trpc/test-endpoint?users=%5B%7B%22id%22%3A1%2C%22name%22%3A%22John%22%7D%2C%7B%22id%22%3A2%2C%22name%22%3A%22Jane%22%7D%5D',
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
        'http://localhost:3000/api/trpc/test-endpoint?stringValue=hello+world&numberValue=42&booleanValue=true&nullValue=null',
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

      const searchParams = new URLSearchParams();
      searchParams.set('contentTypes', JSON.stringify(['booking', 'payment', 'user']));
      const mockRequest = { nextUrl: { searchParams } };
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

      const searchParams = new URLSearchParams();
      searchParams.set('ids', JSON.stringify([1, 2, 3, 4, 5]));
      const mockRequest = { nextUrl: { searchParams } };
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

      const searchParams = new URLSearchParams();
      searchParams.set('flags', JSON.stringify([true, false, true]));
      const mockRequest = { nextUrl: { searchParams } };
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

      const searchParams = new URLSearchParams();
      searchParams.set('emptyArray', JSON.stringify([]));
      const mockRequest = { nextUrl: { searchParams } };
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

      const searchParams = new URLSearchParams();
      searchParams.set('matrix', JSON.stringify([[1, 2], [3, 4], [5, 6]]));
      const mockRequest = { nextUrl: { searchParams } };
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

      const searchParams = new URLSearchParams();
      searchParams.set('where', JSON.stringify({ status: 'active', type: 'premium' }));
      const mockRequest = { nextUrl: { searchParams } };
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

      const searchParams = new URLSearchParams();
      searchParams.set('filter', JSON.stringify({ 
        user: { name: 'John', age: 30 },
        settings: { theme: 'dark', notifications: true }
      }));
      const mockRequest = { nextUrl: { searchParams } };
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

      const searchParams = new URLSearchParams();
      searchParams.set('emptyObj', JSON.stringify({}));
      const mockRequest = { nextUrl: { searchParams } };
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
        includeArchived: z.string().transform((val) => val === 'true'),
        limit: z.coerce.number()
      });
      const mockAction = jest.fn().mockReturnValue({ success: true });
      const testRouter = router({
        analyticsFetcher: endpoint.input(schema).action(mockAction)
      });

      const searchParams = new URLSearchParams();
      searchParams.set('contentTypes', JSON.stringify(['booking', 'payment']));
      searchParams.set('organizationId', 'qlmskjdqslmdf');
      searchParams.set('endDate', '03-10-2025');
      searchParams.set('where', JSON.stringify({ status: 'active', priority: 1 }));
      searchParams.set('includeArchived', 'false');
      searchParams.set('limit', '100');

      const mockRequest = { nextUrl: { searchParams } };
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

      const searchParams = new URLSearchParams();
      searchParams.set('users', JSON.stringify([
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' }
      ]));

      const mockRequest = { nextUrl: { searchParams } };
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

    it('falls back to string parsing for invalid JSON', async () => {
      const schema = z.object({
        validJson: z.array(z.string()),
        invalidJson: z.string()
      });
      const mockAction = jest.fn().mockReturnValue({ success: true });
      const testRouter = router({
        testEndpoint: endpoint.input(schema).action(mockAction)
      });

      const searchParams = new URLSearchParams();
      searchParams.set('validJson', JSON.stringify(['valid', 'array']));
      searchParams.set('invalidJson', 'not-valid-json');

      const mockRequest = { nextUrl: { searchParams } };
      const handler = createTrpcAPI({ router: testRouter });

      await handler(mockRequest as any, { params: Promise.resolve({ trpc: 'test-endpoint' }) });

      expect(mockAction).toHaveBeenCalledWith(
        {
          validJson: ['valid', 'array'],
          invalidJson: 'not-valid-json'
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
        'http://localhost:3000/api/trpc/test-endpoint?nullValue=null',
        expect.any(Object)
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

      const searchParams = new URLSearchParams();
      searchParams.set('validJson', JSON.stringify(['valid', 'array']));
      searchParams.set('invalidJson', 'plain-string-not-json');

      const mockRequest = { nextUrl: { searchParams } };
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

    it('preserves primitive values as strings even when they are valid JSON', async () => {
      const schema = z.object({
        stringId: z.string(),
        stringAge: z.string(),
        boolString: z.string(),
        nullString: z.string(),
        arrayData: z.array(z.string()),
        objectData: z.object({ key: z.string() })
      });
      const mockAction = jest.fn().mockReturnValue({ success: true });
      const testRouter = router({
        testEndpoint: endpoint.input(schema).action(mockAction)
      });

      const searchParams = new URLSearchParams();
      searchParams.set('stringId', '123'); // Valid JSON number, but kept as string
      searchParams.set('stringAge', '30'); // Valid JSON number, but kept as string  
      searchParams.set('boolString', 'true'); // Valid JSON boolean, but kept as string
      searchParams.set('nullString', 'null'); // Valid JSON null, but kept as string
      searchParams.set('arrayData', JSON.stringify(['item1', 'item2'])); // Array parsed as JSON
      searchParams.set('objectData', JSON.stringify({ key: 'value' })); // Object parsed as JSON

      const mockRequest = { nextUrl: { searchParams } };
      const handler = createTrpcAPI({ router: testRouter });

      await handler(mockRequest as any, { params: Promise.resolve({ trpc: 'test-endpoint' }) });

      expect(mockAction).toHaveBeenCalledWith(
        {
          stringId: '123', // String, not number 123
          stringAge: '30', // String, not number 30
          boolString: 'true', // String, not boolean true
          nullString: 'null', // String, not null value
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
        expect.stringContaining('http://localhost:3000/api/trpc/test-endpoint?largeData='),
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
        expect.stringContaining('http://localhost:3000/api/trpc/test-endpoint?deepData='),
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

      // Simulate serialization (client-side)
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(originalData)) {
        if (Array.isArray(value) || (value !== null && typeof value === 'object')) {
          searchParams.set(key, JSON.stringify(value));
        } else {
          searchParams.set(key, String(value));
        }
      }

      // Simulate deserialization (server-side)
      const mockRequest = { nextUrl: { searchParams } };
      const handler = createTrpcAPI({ router: testRouter });

      await handler(mockRequest as any, { params: Promise.resolve({ trpc: 'test-endpoint' }) });

      expect(deserializedData).toEqual(originalData);
    });
  });
});