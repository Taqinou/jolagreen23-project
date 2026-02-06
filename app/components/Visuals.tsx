import { readdir } from "fs/promises";
import path from "path";

import VisualsClient from "./VisualsClient";

interface GalleryImage {
  src: string;
  alt: string;
}

const GALLERY_PATH = path.join(process.cwd(), "public/images/gallery");
const IMAGE_EXTENSIONS = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);

function formatAlt(fileName: string): string {
  const parsedName = path.parse(fileName).name;
  const cleanedName = parsedName
    .replaceAll(/[_-]+/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim();

  return cleanedName.length > 0 ? cleanedName : "Gallery image";
}

async function loadGalleryImages(): Promise<GalleryImage[]> {
  try {
    const entries = await readdir(GALLERY_PATH, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((fileName) => IMAGE_EXTENSIONS.has(path.extname(fileName).toLowerCase()))
      .sort((first, second) => first.localeCompare(second, "fr"))
      .map((fileName) => ({
        src: `/images/gallery/${encodeURIComponent(fileName)}`,
        alt: formatAlt(fileName),
      }));
  } catch (error) {
    console.error("Failed to load gallery images", error);
    return [];
  }
}

export default async function Visuals() {
  const images = await loadGalleryImages();
  return <VisualsClient images={images} />;
}
