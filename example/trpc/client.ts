import "client-only";

import { createTrpcQueryClient } from "../../src/create-trpc-query-client";
import { type AppRouter } from "./router";
import { useQuery } from "@tanstack/react-query";

const url = "http://localhost:3000/api/trpc";

export const clientTrpc: ReturnType<typeof createTrpcQueryClient<AppRouter>> = createTrpcQueryClient<AppRouter>({
  url,
  useQuery
});
