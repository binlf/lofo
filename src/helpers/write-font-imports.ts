import path from "path";
import type { Family } from "./group-fonts-by-family";
import fs from "fs-extra";

export const writeFontImports = (
  fontsDirPath: string,
  fontFamilies: Family[]
) => {
  // app/layout.tsx, src/app/layout.tsx
  // let layoutFilePath = path.join(__dirname);
  fs.moveSync(fontsDirPath, `./public/fonts`);
};
