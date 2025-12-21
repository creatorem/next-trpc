"use client";

import React, { useEffect } from "react";
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

  useEffect(() => {
    const asyncFn = async () => {
      await clientTrpc.analyticsFetcher.fetch({
        contentTypes: ["booking"],
        organizationId: "qlmskjdqslmdf",
        endDate: "03-10-2025",
        where: {
          null: null,
          false: false,
          undefined: undefined,
          nan: NaN,
          number: 34,
        },
      });
    };
    asyncFn();
  }, []);

  if (user.isLoading) {
    return <>Loading...</>;
  }

  return <>{JSON.stringify(user.data)}</>;
};
