import { CtxRouter } from "../../src/core";
import z from "zod";

export const createContext = async () => {
  return {
    hello: true,
    howAreYou: "fine and you?",
  };
};

const ctx = new CtxRouter<Awaited<ReturnType<typeof createContext>>>();

interface MockUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface MockOrganization {
  id: string;
  name: string;
  slug: string;
  description: string;
  memberCount: number;
  createdAt: string;
}

const tableSchemaMap = {
  order: true,
  booking: false,
};

const analyticsFetcherSchema = z.object({
  contentTypes: z.array(
    z.enum(
      Object.keys(tableSchemaMap) as unknown as readonly [
        keyof typeof tableSchemaMap,
        ...(keyof typeof tableSchemaMap)[]
      ]
    )
  ),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  // Optional where object passed from client; server interprets it if provided
  where: z.record(z.any()).optional(),
  organizationId: z.string().optional(),
});

export const appRouter = ctx.router({
  getUser: ctx.endpoint.action(async ({ hello, howAreYou, request }) => {
    // console.log({
    //   myCustomContext: {
    //     hello,
    //     howAreYou,
    //   },
    //   nextjsRequest: request,
    // });

    return new Promise<MockUser>((resolve) => {
      setTimeout(() => {
        resolve({
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          avatar: "https://avatar.example.com/john.jpg",
        });
      }, 1000);
    });
  }),
  greeting: ctx.endpoint
    .input(
      z.object({
        name: z.string(),
        age: z.coerce.number(),
      })
    )
    .action(({ name, age }, { howAreYou }) => {
      console.log({ howAreYou });
      return `Hi my name is ${name}, and I am ${age} years old.`;
    }),
  test: ctx.endpoint.action(async ({ hello, howAreYou, request }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          avatar: "https://avatar.example.com/john.jpg",
        });
      }, 1000);
    });
  }),
  analyticsFetcher: ctx.endpoint
    .input(analyticsFetcherSchema)
    .action(async (inputs) => {
      console.log("analyticsFetcher");
      console.log({ inputs });
      return { test: true };
    }),
  getOrganization: ctx.endpoint
    .input(
      z.object({
        orgSlug: z.string(),
      })
    )
    .action(async ({ orgSlug }, { hello, howAreYou, request }) => {
      // console.log({
      //   myCustomContext: {
      //     hello,
      //     howAreYou,
      //   },
      //   nextjsRequest: request,
      //   orgSlug,
      // });

      return new Promise<MockOrganization>((resolve) => {
        setTimeout(() => {
          resolve({
            id: "org-123",
            name: `Organization ${orgSlug}`,
            slug: orgSlug,
            description: `This is a mock organization for ${orgSlug}`,
            memberCount: 25,
            createdAt: "2023-01-01T00:00:00.000Z",
          });
        }, 1000);
      });
    }),
});

export type AppRouter = typeof appRouter;
