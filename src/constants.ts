export const FONTS_DIR_NAME = "fonts";
export const FONT_DIRS_TO_CHECK = [
  "public",
  "public/assets",
  "src",
  "src/app",
  "src/public",
  "src/public/assets",
  "app",
  "assets",
];
export const FONT_FILE_EXTENSIONS = ["ttf", "otf", "woff", "woff2"];
export const LOCAL_FONT_IMPORT_DEST = "layout.tsx";
export const NEXT_LOCAL_FONT_IMPORT_STATEMENT =
  'import localfont from "next/font/local"';
export const NEXT_LOCAL_FONTS_DOCS =
  "https://nextjs.org/docs/app/building-your-application/optimizing/fonts#local-fonts";
export const LOFO_LOCAL_FONT_IMPORT_STATEMENT =
  'import localfonts, { Poppins } from "../../public/fonts"\n// IMPORT YOUR LOCAL FONTS AS A DEFAULT EXPORT[import localfonts from ...]\n// OR AS A NAMED EXPORT[import { <font_name> } from ...]\n// YOU SHOULD PROBABLY GET RID OF THESE COMMENTS NOW\n\n';
