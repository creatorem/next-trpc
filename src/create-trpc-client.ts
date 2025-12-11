import { Router, type Endpoint, type router } from "./core";
import { kebabize } from "./utils";

type TrpcClient<R extends Router<any>> = {
  [K in keyof R]: R[K] extends Endpoint<infer Output, infer Input, any>
    ? Input extends undefined
      ? { fetch: () => Promise<Output> }
      : {
          fetch: (
            input: Input extends import("zod").Schema
              ? import("zod").infer<Input>
              : Input
          ) => Promise<Output>;
        }
    : never;
};

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
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(input)) {
        searchParams.append(key, String(value));
      }
      requestUrl += `?${searchParams.toString()}`;
    }

    const headerObject =
      typeof headers === "function" ? await headers() : headers;
    const response = await fetch(requestUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...headerObject,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Request failed");
    }

    const result = await response.json();
    return result.data;
  };

export interface createTrpcClientOptions {
  url: string;
  headers: HeadersInit | (() => Promise<HeadersInit>);
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
        };
      }
      return undefined;
    },
  });
};
