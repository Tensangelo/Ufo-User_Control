import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { UsersScreen } from "@/features/users/components/UsersScreen";
import { UsersScreenFallback } from "@/features/users/components/UsersScreenFallback";

export const metadata: Metadata = {
  title: "Ufo · User Control",
};

export default function UsersPage(): ReactNode {
  return (
    <Suspense fallback={<UsersScreenFallback />}>
      <UsersScreen />
    </Suspense>
  );
}
