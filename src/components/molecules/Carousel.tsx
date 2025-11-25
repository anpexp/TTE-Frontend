// src/components/organisms/Carousel.tsx
"use client";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

export type CarouselItem = { id: string; imageUrl: string; alt?: string };

function Carousel({ source }: { source: string }) {
  const fallback = useMemo<CarouselItem[]>(
    () => [
      { id: "1", imageUrl: "https://picsum.photos/1200/400?1", alt: "banner1" },
      { id: "2", imageUrl: "https://picsum.photos/1200/400?2", alt: "banner2" },
      { id: "3", imageUrl: "https://picsum.photos/1200/400?3", alt: "banner3" },
    ],
    []
  );

  const [images, setImages] = useState<CarouselItem[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let active = true;
    fetch(source)
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        const arr = Array.isArray(data) ? data : [];
        setImages(arr.length ? arr : fallback);
      })
      .catch(() => {
        if (active) setImages(fallback);
      });
    return () => {
      active = false;
    };
  }, [source, fallback]);

  useEffect(() => {
    if (!images.length) return;
    if (index >= images.length) setIndex(0);
  }, [images.length, index]);

  const safeLen = images.length || 1;

  const next = useCallback(() => setIndex((i) => (i + 1) % safeLen), [safeLen]);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + safeLen) % safeLen),
    [safeLen]
  );

  if (!images.length) return null;

  return (
    <div className="relative w-full overflow-hidden">
      <img
        src={images[index].imageUrl}
        alt={images[index].alt || ""}
        className="h-96 w-full object-cover transition-all duration-700"
      />
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 px-2 py-1 rounded"
        aria-label="Previous"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 px-2 py-1 rounded"
        aria-label="Next"
      >
        ›
      </button>
    </div>
  );
}

export default memo(Carousel);
