"use server";

import { serverTrpc } from "~/trpc/server-client";
import { ClientComp } from "./client-comp";

export default async function Home() {
  const user = await serverTrpc.getUser.fetch();
  console.log({ user });

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <ClientComp />
      </main>
    </div>
  );
}
