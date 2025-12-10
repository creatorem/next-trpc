"use client";

import { useQuery } from "@tanstack/react-query";
import { CreateRpcClientOptions, getRpcFetch } from "./create-rpc-client";
import { Router, type Endpoint, type router } from "./core";

type RpcClient<R extends Router<any>> = {
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

export const createRpcQueryClient = <
  R extends ReturnType<typeof router<any, Router<any>>>
>(
  opts: CreateRpcClientOptions
): RpcClient<R> => {
  return new Proxy({} as RpcClient<R>, {
    get(target, prop) {
      if (typeof prop === "string") {
        return {
          fetch: getRpcFetch({
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
              queryFn: getRpcFetch({
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
