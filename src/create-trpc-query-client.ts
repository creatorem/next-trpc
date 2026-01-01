"use client";

import type { useQuery as useQueryType } from "@tanstack/react-query";
import {
  type EndpointClient,
  createTrpcClientOptions,
  getTrpcFetch,
} from "./create-trpc-client";
import type { Router, Endpoint, router } from "./core";
import z from "zod";

export type TrpcClientWithQuery<R extends Router<any>> = {
  [K in keyof R]: R[K] extends Endpoint<infer Output, infer Input, any>
    ? EndpointClient<Input, Output> & {
        useQuery: Input extends import("zod").Schema
          ? (
              queryOptions: Omit<
                Parameters<typeof useQueryType>[0],
                "queryKey" | "queryFn"
              > & {
                input: z.infer<Input>;
              }
            ) => ReturnType<
              typeof useQueryType<
                Awaited<Output>,
                Error,
                Awaited<Output>,
                string[]
              >
            >
          : (
              queryOptions?: Omit<
                Parameters<typeof useQueryType>[0],
                "queryKey" | "queryFn"
              >
            ) => ReturnType<
              typeof useQueryType<
                Awaited<Output>,
                Error,
                Awaited<Output>,
                string[]
              >
            >;
      }
    : never;
};

export const createTrpcQueryClient = <
  R extends ReturnType<typeof router<any, Router<any>>>
>(
  opts: createTrpcClientOptions & { useQuery: typeof useQueryType }
): TrpcClientWithQuery<R> => {
  return new Proxy({} as TrpcClientWithQuery<R>, {
    get(target, prop) {
      if (typeof prop === "string") {
        return {
          fetch: getTrpcFetch({
            endpointSlug: prop,
            ...opts,
          }),
          useQuery: (
            queryOptions?: Omit<
              Parameters<typeof useQueryType>[0],
              "queryKey" | "queryFn"
            > & {
              input?: any;
            }
          ) => {
            const endpointName = prop.replace(/([A-Z])/g, "-$1").toLowerCase();
            return opts.useQuery({
              ...queryOptions,
              queryKey: [endpointName],
              queryFn: async () => {
                const fetcher = getTrpcFetch({
                  endpointSlug: prop,
                  ...opts,
                });
                return await fetcher(queryOptions?.input);
              },
            });
          },
        };
      }
      return undefined;
    },
  });
};
