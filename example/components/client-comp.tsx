"use client";

import React from "react";
import { clientTrpc } from "~/trpc/client";

export const ClientComp: React.FC = () => {
  const user = clientTrpc.getUser.useQuery();
  console.log({ clientUser: user.data });

  const mockOrganizationSlug = "my-mock-org-slug";
  const organization = clientTrpc.getOrganization.useQuery({
    input: {
      orgSlug: mockOrganizationSlug,
    },
  });
  console.log({ clientOrganization: organization });

  if (user.isLoading) {
    return <>Loading...</>;
  }

  return <>{JSON.stringify(user.data)}</>;
};
