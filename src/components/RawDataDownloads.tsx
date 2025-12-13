"use client";

import { Download } from "lucide-react";

export function RawDataDownloads({
  urls,
}: {
  urls: Record<string, string | null | undefined> | null;
}) {
  if (!urls)
    return (
      <div className="text-center text-muted-foreground">
        No download links available
      </div>
    );

  return (
    <div className="space-y-2">
      {Object.entries(urls).map(([key, url]) => (
        <a
          key={key}
          href={url ?? ""}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
        >
          <span className="capitalize font-mono text-sm">
            {key.replace(/_/g, " ")}
          </span>
          <Download className="h-4 w-4 text-muted-foreground" />
        </a>
      ))}
    </div>
  );
}
