"use client";

import { useQuery } from "@tanstack/react-query";
import { createTrpcClientOptions, getTrpcFetch } from "./create-trpc-client";
import { Router, type Endpoint, type router } from "./core";

type TrpcClient<R extends Router<any>> = {
  [K in keyof R]: R[K] extends Endpoint<infer Output, infer Input, any>
    ? Input extends undefined
      ? {
          fetch: () => Promise<Output>;
          useQuery: (
            queryOptions?: Omit<
              Parameters<typeof useQuery>[0],
              "queryKey" | "queryFn"
            >
          ) => ReturnType<
            typeof useQuery<Promise<Output>, Error, Promise<Output>, string[]>
          >;
        }
      : {
          fetch: (
            input: Input extends import("zod").Schema
              ? import("zod").infer<Input>
              : Input
          ) => Promise<Output>;
          useQuery: (
            queryOptions?: Omit<
              Parameters<typeof useQuery>[0],
              "queryKey" | "queryFn"
            >
          ) => ReturnType<
            typeof useQuery<Promise<Output>, Error, Promise<Output>, string[]>
          >;
        }
    : never;
};

export const createTrpcQueryClient = <
  R extends ReturnType<typeof router<any, Router<any>>>
>(
  opts: createTrpcClientOptions
): TrpcClient<R> => {
  return new Proxy({} as TrpcClient<R>, {
    get(target, prop) {
      if (typeof prop === "string") {
        return {
          fetch: getTrpcFetch({
            endpointSlug: prop,
            ...opts,
          }),
          useQuery: (
            queryOptions?: Omit<
              Parameters<typeof useQuery>[0],
              "queryKey" | "queryFn"
            >
          ) => {
            const endpointName = prop.replace(/([A-Z])/g, "-$1").toLowerCase();
            return useQuery({
              ...queryOptions,
              queryKey: [endpointName],
              queryFn: getTrpcFetch({
                endpointSlug: prop,
                ...opts,
              }),
            });
          },
        };
      }
      return undefined;
    },
  });
};
