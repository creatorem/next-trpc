import { Router, type Endpoint, type router } from "./core";
import { kebabize } from "./utils";
import z from "zod";

export type EndpointClient<Input, Output> = Input extends undefined
  ? { fetch: () => Promise<Output>, key: string }
  : {
    fetch: (
      input: Input extends import("zod").Schema ? z.infer<Input> : Input
    ) => Promise<Output>;
    key: string
  };

export type TrpcClient<R extends Router<any>> = {
  [K in keyof R]: R[K] extends Endpoint<infer Output, infer Input, any>
  ? EndpointClient<Input, Output>
  : never;
};

function serialize(str: string): string {
  return btoa(
    encodeURIComponent(
      JSON.stringify(str, (key, value) => {
        if (Number.isNaN(value)) {
          return "__NAN__";
        }
        return value;
      })
    ).replace(/%([0-9A-F]{2})/g, function (match, p1) {
      return String.fromCharCode(parseInt(p1, 16));
    })
  );
}

export const getTrpcFetch =
  ({
    endpointSlug,
    url,
    headers,
  }: {
    endpointSlug: string;
  } & createTrpcClientOptions) =>
    async (input?: any) => {
      const endpointName = kebabize(endpointSlug);

      // Build URL with search params if input exists
      let requestUrl = `${url}/${endpointName}`;
      if (input) {
        requestUrl += `?input=${serialize(input)}`;
      }

      const headerObject =
        typeof headers === "function" ? await headers() : headers || {};
      const response = await fetch(requestUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...headerObject,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error( errorData )
        throw new Error(errorData.error || "Request failed");
      }

      const result = await response.json();
      return result.data;
    };

export interface createTrpcClientOptions {
  url: string;
  headers?: HeadersInit | (() => Promise<HeadersInit>);
}

export const createTrpcClient = <
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
          key: kebabize(prop)
        };
      }
      return undefined;
    },
  });
};
