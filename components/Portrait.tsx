export function Portrait({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  return (
    <div className="portrait-frame">
      <img src={src} alt={alt} fetchPriority={priority ? "high" : "auto"} />
    </div>
  );
}
