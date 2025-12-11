import "server-only";

import { createTrpcClient } from "../../src/create-trpc-client";
import { AppRouter } from "./router";

const url = "https://localhost:3000/api/trpc";

export const serverTrpc = createTrpcClient<AppRouter>({
  url,
});
