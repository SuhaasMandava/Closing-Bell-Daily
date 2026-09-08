import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  /** "banner" sits inside a card, clipped by the card's own rounded corners.
   *  "hero" stands alone on an article page and rounds its own corners. */
  variant?: "banner" | "hero";
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
            : "(min-width: 768px) 40vw, 100vw"
        }
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}
