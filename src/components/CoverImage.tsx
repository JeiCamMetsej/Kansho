"use client";

import { useState } from "react";

interface CoverImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  priority?: boolean;
}

export default function CoverImage({
  src,
  alt,
  className = "",
  fallback,
  priority = false,
}: CoverImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        {fallback ?? (
          <span className="text-2xl font-light text-[var(--text-tertiary)]">?</span>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 bg-[var(--bg-tertiary)] animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        } ${className}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading={priority ? "eager" : "lazy"}
      />
    </div>
  );
}
