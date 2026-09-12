import { useState } from "react";

type Props = {
  src: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
};

/** Player photo that degrades to a cricket icon when the image can't load. */
export function PlayerPhoto({ src, alt, className = "", fallbackClassName = "" }: Props) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        aria-label={alt}
        role="img"
        className={`flex items-center justify-center bg-muted text-2xl ${className} ${fallbackClassName}`}
      >
        <span aria-hidden="true">🏏</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
