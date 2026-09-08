import fs from "node:fs";
import path from "node:path";

const EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

/**
 * Looks for `<slug>.{jpg,jpeg,png,webp}` under `public/images/<publicSubdir>/`
 * and returns the public URL path if one exists, e.g. "/images/articles/2026-08-13.jpg".
 * Lets publishing a photo be "drop a file in," matching the existing
 * "drop an .mdx file in" workflow — no frontmatter edit required.
 */
export function findImage(publicSubdir: string, slug: string): string | null {
  const dir = path.join(process.cwd(), "public", "images", publicSubdir);

  for (const ext of EXTENSIONS) {
    if (fs.existsSync(path.join(dir, `${slug}${ext}`))) {
      return `/images/${publicSubdir}/${slug}${ext}`;
    }
  }

  return null;
}
