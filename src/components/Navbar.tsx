"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";

export function Navbar() {
  return (
    <header className="container mx-auto p-4 md:p-8 sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      <Link
        href="/"
        className="text-2xl font-bold tracking-tight transition-colors hover:text-foreground/80"
      >
        AutoRestTest
      </Link>
      <div className="flex items-center gap-4">
        <ModeToggle />
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
