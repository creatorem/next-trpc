import "client-only";

import { createTrpcQueryClient } from "../../src/create-trpc-query-client";
import { type AppRouter } from "./router";

const url = "http://localhost:3000/api/trpc";

export const clientTrpc: ReturnType<typeof createTrpcQueryClient<AppRouter>> = createTrpcQueryClient<AppRouter>({
  url,
});
