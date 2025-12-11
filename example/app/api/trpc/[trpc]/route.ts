import { createTrpcAPI } from "../../../../../src/create-trpc-api";
import { appRouter, createContext } from "~/trpc/router";

const handler = createTrpcAPI({
  router: appRouter,
  ctx: createContext,
});

export { handler as GET, handler as POST };
