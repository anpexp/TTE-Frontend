import { useEffect, useState } from "react";

export type CarouselItem = { id: string; imageUrl: string; alt?: string };

export default function Carousel({ source }: { source: string }) {
  const [images, setImages] = useState<CarouselItem[]>([]);

  useEffect(() => {
   
    fetch(source)
      .then(r => r.json())
      .then(data => setImages(data))
      .catch(() =>
        setImages([
          { id: "1", imageUrl: "https://picsum.photos/1200/400?1", alt: "banner1" },
          { id: "2", imageUrl: "https://picsum.photos/1200/400?2", alt: "banner2" },
          { id: "3", imageUrl: "https://picsum.photos/1200/400?3", alt: "banner3" },
        ])
      );
  }, [source]);
//se puede meter dentro del use memo.
  const [index, setIndex] = useState(0);
  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  if (!images.length) return null;

  return (
    <div className="relative w-full overflow-hidden">
      <img
        src={images[index].imageUrl}
        alt={images[index].alt}
        className="h-96 w-full object-cover transition-all duration-700"
      />
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 px-2 py-1 rounded">‹</button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 px-2 py-1 rounded">›</button>
    </div>
  );
}
