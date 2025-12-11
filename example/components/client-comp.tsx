"use client";

import React from "react";
import { clientTrpc } from "~/trpc/client";

export const ClientComp: React.FC = () => {
  const user = clientTrpc.getUser.useQuery();
  console.log({ clientUser: user.data });

  if (user.isLoading) {
    return <>Loading...</>;
  }

  return <>{JSON.stringify(user.data)}</>;
};
