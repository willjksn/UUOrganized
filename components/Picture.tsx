import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

export function Picture({ src, alt, width, height, sizes, priority, className }: Props) {
  if (src.startsWith("http")) {
    return <img className={className} src={src} alt={alt} width={width} height={height} />;
  }

  return (
    <Image
      className={className}
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
    />
  );
}
