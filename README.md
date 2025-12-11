# next-trpc

A simple typed rpc interface to easily type api endpoints in an app router nextjs application.

## Installation

```sh
npm install @creatorem/next-trpc
```

<br/>

## Setup

### Create a router file

Contains your api endpoints.

`trpc/router.ts`

```ts
import { router, endpoint } from "@creatorem/next-trpc";
import z from "zod";

export const appRouter = router({
  getUser: endpoint.action(async ({ db }) => {
    return await myAsyncFunction();
  }),
  greeting: endpoint
    .input(
      // you can add zod typechecking to your entry params
      z.object({
        name: z.string(),
        age: z.coerce.number(),
      })
    )
    .action(({ name, age }) => {
      return `Hi my name is ${name}, and I am ${age} years old.`;
    }),
});

export type AppRouter = typeof appRouter;
```

### Connect your router to an api endpoint.

`app/api/trpc/[trpc]/route.ts`

```ts
import { createTrpcAPI } from "@creatorem/next-trpc/server";
import { appRouter } from "~/trpc/router";

const handler = createTrpcAPI({
  router: appRouter,
});

export { handler as GET, handler as POST };
```

### Start fetching with a type safe client!

`trpc/client.ts`

```ts
import { envs } from "~/envs";
import { createTrpcClient } from "@creatorem/next-trpc/client";
import { type AppRouter } from "./router";

const url = envs().NEXT_PUBLIC_YOUR_APP_URL + "/api/trpc";

export const trpc = createTrpcClient<AppRouter>({
  url,
  headers: async () => {
    // add custom headers like Authorization to make it works with auth logic
    return {
      /* Authorization: `Bearer ${jwt!}` */
    };
  },
});
```

Done !

## Usage

Now you can use the `trpc` client and server side.

`app/layout.tsx`

```tsx
import React from "react";
import { redirect } from "next/navigation";
import { trpc } from "~/trpc/client";

export default async function Layout(
  props: React.PropsWithChildren
): Promise<React.JSX.Element> {
  const user = await trpc.getUser.fetch();

  if (!user) {
    return redirect(/* path to login page */);
  }

  return <>{props.children}</>;
}
```

### Integrated useQuery hook usage

We offer a client side only function to create client object that pre-implement the `useQuery` hook from `@tanstack/react-query` package.

You need to have `@tanstack/react-query` installed.

```sh
npm install @tanstack/react-query
```

Then you can create the following file :

`trpc/query-client.ts`

```ts
import "client-only";

import { envs } from "~/envs";
import { createTrpcQueryClient } from "@creatorem/next-trpc/query-client";
import { type AppRouter } from "./router";

const url = envs().NEXT_PUBLIC_YOUR_APP_URL + "/api/trpc";

export const clientTrpc = createTrpcQueryClient<AppRouter>({
  url,
  headers: async () => {
    // add custom headers like Authorization to make it works with auth logic
    return {
      /* Authorization: `Bearer ${jwt!}` */
    };
  },
});
```

Now you can do :

```tsx
"use client";

import React from "react";
import { clientTrpc } from "~/trpc/query-client";

export const MyClientComponent: React.FC<React.PropsWithChildren> = (props) => {
  const { data: user } = clientTrpc.getUser.useQuery();
  /* ... */

  return <>{props.children}</>;
};
```

> [!WARNING]
> Do not forget to wrap your app with `<QueryClientProvider>`. See [installation instructions](https://tanstack.com/query/latest/docs/framework/react/installation) for more details.

## Use a router context

You can use a context object to pass data to all your endpoint callbacks.

`trpc/router.ts`

```ts {4-7,9}
import { CtxRouter, endpoint } from "@creatorem/next-trpc";
import z from "zod";

export const createContext = async () => {
  /* your own context logic here ... */
  return { db /* let's say db is a database client. */ };
};

const ctx = new CtxRouter<Awaited<ReturnType<typeof createContext>>>();

export const appRouter = ctx.router({
  getUser: ctx.endpoint.action(async ({ db }) => {
    return await db.user.get();
  }),
  greeting: ctx.endpoint
    .input(
      // you can add zod typechecking to your entry params
      z.object({
        name: z.string(),
        age: z.coerce.number(),
      })
    )
    .action(({ name, age }) => {
      return `Hi my name is ${name}, and I am ${age} years old.`;
    }),
});

export type AppRouter = typeof appRouter;
```

> [!NOTE]
> Param types are serialized during the http request to the api. You need to use `z.coerce` for non-string types.

Next pass your context to the nextjs api endpoint.

`app/api/trpc/[trpc]/route.ts`

```ts {6}
import { createTrpcAPI } from "@creatorem/next-trpc/server";
import { appRouter, createContext } from "~/trpc/router";

const handler = createTrpcAPI({
  router: appRouter,
  ctx: createContext,
});

export { handler as GET, handler as POST };
```
