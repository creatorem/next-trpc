"server-only";

import { type NextRequest, NextResponse } from "next/server";
import { type router as routerFn, type Endpoint, Router } from "./core";
import { camelize } from "./utils";

function deserialize(str: string): string {
  return JSON.parse(decodeURIComponent(
    Array.prototype.map
      .call(atob(str), function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      })
      .join(''),
  ),  (key, value) => {
    if (value === '__NAN__') {
      return NaN;
    }
    return value;
  })
}

const parseInput = (request: NextRequest, endpoint: Endpoint<any, any, any>) => {
  if (!endpoint.input) return undefined;

  const searchParams = request.nextUrl.searchParams;
  const input = searchParams.get('input')

  if(!input){
    throw new Error('"input" not defined in the search params.')
  }

  return endpoint.input.parse(deserialize(input));
};

export const createTrpcAPI = <Ctx>({
  router,
  ctx,
}: {
  router: ReturnType<typeof routerFn<any, Router<any>>>;
  ctx?: (request: NextRequest) => Promise<Ctx>;
}) => {
  return async function handler(
    request: NextRequest,
    context: { params: Promise<unknown> }
  ): Promise<NextResponse<unknown>> {
    const params = (await context.params) as { trpc: string };

    if (!("trpc" in params)) {
      return NextResponse.json(
        {
          data: null,
          error: "You must call createAPI in a [trpc]/route.ts file.",
        },
        { status: 400 }
      );
    }
    
    if (!params.trpc) {
      return NextResponse.json(
        {
          data: null,
          error:
            "You must pass a params in your [trpc]/you-must-put-a-param-here call",
        },
        { status: 400 }
      );
    }

    const endpointAttribute = camelize(params.trpc);

    if (!(endpointAttribute in router) || !router[endpointAttribute]) {
      return NextResponse.json(
        {
          data: null,
          error: `No ${endpointAttribute} endpoints found in the router object.`,
        },
        { status: 400 }
      );
    }

    const endpoint = router[endpointAttribute];

    try {
      const input = parseInput(request, endpoint);
      const context = (ctx ? (await ctx(request)) : {}) as Ctx;
      const result = endpoint.input
        ? await endpoint.action(input, { ...context, request })
        : await (endpoint as Endpoint<any, undefined, Ctx>).action({
            ...context,
            request,
          });

      return NextResponse.json({ data: result }, { status: 200 });
    } catch (error) {
      if (error instanceof Error && "issues" in error) {
        // Zod validation error
        return NextResponse.json(
          { data: null, error: "Invalid request data", details: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { data: null, error: "Internal Server Error" },
        { status: 500 }
      );
    }
  };
};
