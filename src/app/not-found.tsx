import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center space-y-6 text-center">
      <div className="space-y-4">
        <SearchX
          className="mx-auto h-16 w-16 text-muted-foreground"
          aria-label="Not Found Icon"
        />
        <h1 className="text-8xl font-black text-foreground sm:text-9xl">
          404
        </h1>
        <p className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
          Page Not Found
        </p>
        <p className="max-w-md text-muted-foreground">
          Oops! The page you are looking for does not exist. It might have been
          moved or deleted.
        </p>
        <Button asChild>
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    </div>
  );
}
