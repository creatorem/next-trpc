"server-only";

import { type NextRequest, NextResponse } from "next/server";
import { type router as routerFn, type Endpoint, Router } from "./core";
import { camelize } from "./utils";

const parseInput = (request: NextRequest, endpoint: Endpoint<any, any>) => {
  if (!endpoint.input) return undefined;

  const searchParams = request.nextUrl.searchParams;
  const paramsObj: Record<string, any> = {};

  // Convert URLSearchParams to object
  for (const [key, value] of searchParams) {
    paramsObj[key] = value;
  }

  // Validate input with endpoint schema
  return endpoint.input.parse(paramsObj);
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
      const context = ctx ? await ctx(request) : {};
      const result = endpoint.input
        ? await endpoint.action(input, { ...context, request })
        : await (endpoint as Endpoint<any, undefined>).action({
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
