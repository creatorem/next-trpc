import { describe, it, expect, jest } from '@jest/globals';
import z from 'zod';
import { endpoint, router, CtxRouter, type Endpoint } from '../core';

describe('core', () => {
  describe('endpoint', () => {
    describe('input method', () => {
      it('creates endpoint with input schema and action', () => {
        const schema = z.object({ name: z.string() });
        const actionFn = jest.fn().mockReturnValue({ success: true });
        
        const result = endpoint.input(schema).action(actionFn);
        
        expect(result.input).toBe(schema);
        expect(result.action).toBe(actionFn);
      });

      it('handles typed input and context', () => {
        const schema = z.object({ id: z.number() });
        type Context = { userId: string };
        
        const actionFn = jest.fn(() => ({ data: 'test' }));
        const result = endpoint.input(schema).action<{ data: string }, Context>(actionFn);
        
        expect(result.input).toBe(schema);
        expect(result.action).toBe(actionFn);
      });
    });

    describe('action method', () => {
      it('creates endpoint without input schema', () => {
        const actionFn = jest.fn().mockReturnValue({ message: 'hello' });
        
        const result = endpoint.action(actionFn);
        
        expect(result.input).toBeUndefined();
        expect(result.action).toBe(actionFn);
      });

      it('handles typed output and context', () => {
        type Context = { role: string };
        const actionFn = jest.fn(() => ({ status: 'ok' }));
        
        const result = endpoint.action<{ status: string }, Context>(actionFn);
        
        expect(result.input).toBeUndefined();
        expect(result.action).toBe(actionFn);
      });
    });
  });

  describe('router', () => {
    it('returns the router object as-is', () => {
      const testRouter = {
        getUser: endpoint.input(z.object({ id: z.string() })).action(() => ({ name: 'test' })),
        getAllUsers: endpoint.action(() => [{ name: 'user1' }, { name: 'user2' }])
      };
      
      const result = router(testRouter);
      
      expect(result).toBe(testRouter);
      expect(result.getUser).toBeDefined();
      expect(result.getAllUsers).toBeDefined();
    });

    it('handles empty router', () => {
      const emptyRouter = {};
      const result = router(emptyRouter);
      
      expect(result).toBe(emptyRouter);
      expect(Object.keys(result)).toHaveLength(0);
    });

    it('preserves router structure with context type', () => {
      type Context = { user: { id: string } };
      const contextRouter = {
        protectedEndpoint: endpoint.input(z.object({ data: z.string() })).action<string, Context>(() => 'protected')
      };
      
      const result = router(contextRouter as any);
      
      expect(result).toBe(contextRouter);
      expect(result.protectedEndpoint).toBeDefined();
    });
  });

  describe('CtxRouter', () => {
    type TestContext = { userId: string; role: string };

    it('creates instance with context type', () => {
      const ctxRouter = new CtxRouter<TestContext>();
      
      expect(ctxRouter).toBeInstanceOf(CtxRouter);
      expect(ctxRouter.endpoint).toBeDefined();
      expect(ctxRouter.router).toBeDefined();
    });

    describe('endpoint.input', () => {
      it('creates endpoint with input schema and typed action', () => {
        const ctxRouter = new CtxRouter<TestContext>();
        const schema = z.object({ name: z.string() });
        const actionFn = jest.fn().mockReturnValue({ created: true });
        
        const result = ctxRouter.endpoint.input(schema).action(actionFn);
        
        expect(result.input).toBe(schema);
        expect(result.action).toBe(actionFn);
      });

      it('maintains context type in action function', () => {
        const ctxRouter = new CtxRouter<TestContext>();
        const schema = z.object({ data: z.string() });
        
        const actionFn = jest.fn((input: z.infer<typeof schema>, context: { userId: string; role: string; request: any }) => {
          return { result: `${input.data}-${context.userId}` };
        });
        
        const result = ctxRouter.endpoint.input(schema).action<{ result: string }>(actionFn);
        
        expect(result.input).toBe(schema);
        expect(result.action).toBe(actionFn);
      });
    });

    describe('endpoint.action', () => {
      it('creates endpoint without input schema', () => {
        const ctxRouter = new CtxRouter<TestContext>();
        const actionFn = jest.fn().mockReturnValue({ status: 'ready' });
        
        const result = ctxRouter.endpoint.action(actionFn);
        
        expect(result.input).toBeUndefined();
        expect(result.action).toBe(actionFn);
      });

      it('maintains context type in action function', () => {
        const ctxRouter = new CtxRouter<TestContext>();
        
        const actionFn = jest.fn((context: { userId: string; role: string; request: any }) => {
          return { userInfo: context.userId };
        });
        
        const result = ctxRouter.endpoint.action<{ userInfo: string }>(actionFn);
        
        expect(result.input).toBeUndefined();
        expect(result.action).toBe(actionFn);
      });
    });

    describe('router method', () => {
      it('returns router object as-is', () => {
        const ctxRouter = new CtxRouter<TestContext>();
        const testRouterObj = {
          endpoint1: ctxRouter.endpoint.action(() => ({ data: 'test1' })),
          endpoint2: ctxRouter.endpoint.input(z.object({ id: z.number() })).action(() => ({ data: 'test2' }))
        };
        
        const result = ctxRouter.router(testRouterObj);
        
        expect(result).toBe(testRouterObj);
        expect(result.endpoint1).toBeDefined();
        expect(result.endpoint2).toBeDefined();
      });

      it('handles empty router object', () => {
        const ctxRouter = new CtxRouter<TestContext>();
        const emptyRouterObj = {};
        
        const result = ctxRouter.router(emptyRouterObj);
        
        expect(result).toBe(emptyRouterObj);
        expect(Object.keys(result)).toHaveLength(0);
      });
    });
  });

  describe('type definitions', () => {
    it('Endpoint type works with different configurations', () => {
      const schema = z.object({ test: z.string() });
      
      // Test endpoint without input
      const noInputEndpoint: Endpoint<string> = {
        action: () => 'result'
      };
      expect(noInputEndpoint.input).toBeUndefined();
      
      // Test endpoint with input
      const withInputEndpoint: Endpoint<number, typeof schema> = {
        input: schema,
        action: (input) => input.test.length
      };
      expect(withInputEndpoint.input).toBe(schema);
      
      // Test endpoint with context
      type Context = { admin: boolean };
      const withContextEndpoint: Endpoint<boolean, undefined, Context> = {
        action: (context) => context.admin
      };
      expect(withContextEndpoint.input).toBeUndefined();
    });
  });
});