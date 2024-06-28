import path from "path";
import fs from "fs-extra";
import type { Family } from "./group-fonts-by-family";
import { logger } from "../utils/logger";
import { getFontSrc } from "../utils/get-font-meta";
import { NEXT_LOCAL_FONT_IMPORT_STATEMENT } from "../constants";

// todo: implement writing font imports to layout file
export const writeFontImports = (
  fontsDirPath: string,
  fontFamilies: Family[]
) => {
  logger.info("Writing font imports...");
  const indexFilePath = path.join(fontsDirPath, "index.ts");
  const content = `${NEXT_LOCAL_FONT_IMPORT_STATEMENT}\n\n${generateFileContent(
    fontFamilies,
    fontsDirPath
  )}`;
  fs.outputFileSync(indexFilePath, content);
  logger.info("Finished writing font imports");

  // fs.moveSync(fontsDirPath, `./public/fonts`);
  // app/layout.tsx, src/app/layout.tsx
  // let layoutFilePath = path.join(process.cwd(), );
  // todo: read directory, if found, generate path relative to read directory
};

const generateFileContent = (ff: Family[], fontsDirPath: string) => {
  const familiesExportsArr = ff.map((family) => {
    return `
    export const ${family.familyName} = localfont({
      \tsrc: ${getFontSrc(family.fonts, fontsDirPath)},
      \tdisplay: "swap",
    })
    `.trim();
  });

  return familiesExportsArr.join("\n");
};
