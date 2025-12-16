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
  id:string,
  name:string,
  email:string,
  avatar:string
}
export const appRouter = ctx.router({
  getUser: ctx.endpoint.action(async ({ hello, howAreYou, request }) => {
    console.log({
      myCustomContext: {
        hello,
        howAreYou,
      },
      nextjsRequest: request,
    });

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
});

export type AppRouter = typeof appRouter;
