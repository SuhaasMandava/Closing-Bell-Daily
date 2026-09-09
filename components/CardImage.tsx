import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  /** "banner" sits inside a grid card, clipped by the card's own rounded
   *  corners. "lead" is the same but taller, for a lone wide lead card where
   *  the banner's fixed short height would crop the photo too aggressively.
   *  "hero" stands alone on an article page and rounds its own corners. */
  variant?: "banner" | "lead" | "hero" | "thumb";
};

export default function CardImage({ src, alt, variant = "banner" }: Props) {
  return (
    <div className={`card-image card-image--${variant}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={
          variant === "hero"
            ? "(min-width: 900px) 44rem, 100vw"
            : variant === "lead"
              ? "(min-width: 860px) 60vw, 100vw"
              : variant === "thumb"
                ? "76px"
                : "(min-width: 768px) 40vw, 100vw"
        }
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}
