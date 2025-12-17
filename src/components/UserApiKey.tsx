"use client";

import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy } from "lucide-react";
import { toast } from "sonner";

async function fetchApiKey(): Promise<{ apiKey: string }> {
  const res = await fetch("/api/v1/user/api-key");
  if (!res.ok) {
    throw new Error("Failed to fetch API key");
  }
  return res.json();
}

export function UserApiKey() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["user-api-key"],
    queryFn: fetchApiKey,
  });

  const handleCopy = () => {
    if (data?.apiKey) {
      navigator.clipboard.writeText(data.apiKey);
      toast.success("API Key copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label htmlFor="apiKey">Your Personal API Key</Label>
        <Skeleton className="h-10 w-full" />
        <p className="text-xs text-muted-foreground pt-1">
          Use this key in your GitHub secrets to authorize CI/CD runs.
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-2">
        <Label htmlFor="apiKey" className="text-destructive">
          Error loading API Key
        </Label>
        <Input value={error.message} disabled className="text-destructive" />
        <p className="text-xs text-muted-foreground pt-1">
          Use this key in your GitHub secrets to authorize CI/CD runs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="apiKey">Your Personal API Key</Label>
      <div className="flex items-center gap-2">
        <Input id="apiKey" value={data?.apiKey} readOnly />
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopy}
          type="button"
        >
          <Copy className="h-4 w-4" />
          <span className="sr-only">Copy API Key</span>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground pt-1">
        Use this key in your GitHub secrets to authorize CI/CD runs.
      </p>
    </div>
  );
}
