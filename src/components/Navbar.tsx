"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <Link href="/" className="text-2xl font-bold">
        AutoRestTest
      </Link>
      <div>
        <SignedOut>
          <Button asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}
