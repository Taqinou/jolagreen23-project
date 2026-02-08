import { readdir } from "fs/promises";
import path from "path";

import VisualsClient from "./VisualsClient";

interface GalleryImage {
  src: string;
  alt: string;
}

const GALLERY_PATH = path.join(process.cwd(), "public/images/gallery");
const IMAGE_EXTENSIONS = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);
const EXTENSION_PRIORITY = [".avif", ".webp", ".jpg", ".jpeg", ".png", ".gif"];

function getExtensionPriority(fileName: string): number {
  const extension = path.extname(fileName).toLowerCase();
  const priority = EXTENSION_PRIORITY.indexOf(extension);
  return priority === -1 ? EXTENSION_PRIORITY.length : priority;
}

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
    const preferredFiles = new Map<string, string>();

    entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((fileName) => IMAGE_EXTENSIONS.has(path.extname(fileName).toLowerCase()))
      .forEach((fileName) => {
        const key = path.parse(fileName).name;
        const previous = preferredFiles.get(key);

        if (!previous || getExtensionPriority(fileName) < getExtensionPriority(previous)) {
          preferredFiles.set(key, fileName);
        }
      });

    return Array.from(preferredFiles.values())
      .sort((first, second) =>
        first.localeCompare(second, "fr", { numeric: true, sensitivity: "base" })
      )
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
