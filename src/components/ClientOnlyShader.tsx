'use client';

import { useState, useEffect } from 'react';
import { CosmicWavesShaders } from '@/components/ui/shadcn-io/cosmic-waves-shaders';

export function ClientOnlyShader() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <CosmicWavesShaders />;
}
