"use client";

import type { useQuery as useQueryType } from "@tanstack/react-query";
import {
  type EndpointClient,
  createTrpcClientOptions,
  getTrpcFetch,
} from "./create-trpc-client";
import type { Router, Endpoint, router } from "./core";

type TrpcClientWithQuery<R extends Router<any>> = {
  [K in keyof R]: R[K] extends Endpoint<infer Output, infer Input, any>
    ? EndpointClient<Input, Output> & {
        useQuery: (
          queryOptions?: Omit<
            Parameters<typeof useQueryType>[0],
            "queryKey" | "queryFn"
          >
        ) => ReturnType<
          typeof useQueryType<Output, Error, Output, string[]>
        >;
      }
    : never;
};

export const createTrpcQueryClient = <
  R extends ReturnType<typeof router<any, Router<any>>>
>(
  opts: createTrpcClientOptions & {useQuery: typeof useQueryType}
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
            >
          ) => {
            const endpointName = prop.replace(/([A-Z])/g, "-$1").toLowerCase();
            return opts.useQuery({
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
