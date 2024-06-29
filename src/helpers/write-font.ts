import path from "path";
import fs, { readdirSync } from "fs-extra";
import type { Family } from "./group-fonts-by-family";
import { logger } from "../utils/logger";
import { getFontSrc } from "../utils/get-font-meta";
import { NEXT_LOCAL_FONT_IMPORT_STATEMENT } from "../constants";
import { folderExists } from "../utils/exists";
// import localfonts, { Poppins } from "../../public/fonts"
// IMPORT YOUR LOCAL FONTS AS A DEFAULT EXPORT[import localfonts from ...] OR AS A NAMED EXPORT[import { <font_name> } from ...]
// YOU SHOULD PROBABLY GET RID OF THESE COMMENTS NOW

// todo: implement writing font imports to layout file
export const writeFontImports = (
  fontsDirPath: string,
  fontFamilies: Family[]
) => {
  logger.info("Writing font exports...");
  const indexFilePath = path.join(fontsDirPath, "index.ts");
  const content = `${NEXT_LOCAL_FONT_IMPORT_STATEMENT}\n\n${generateFileContent(
    fontFamilies,
    fontsDirPath
  )}`;
  fs.outputFileSync(indexFilePath, content);
  logger.info("Finished writing font exports");
  fs.moveSync(fontsDirPath, `./public/fonts`);
  logger.info("Importing fonts in layout file...");
  // app/layout.tsx, src/app/layout.tsx
  const srcDir = path.join(process.cwd(), "/src");
  const appDirPath = folderExists(srcDir)
    ? path.join(srcDir, "/app")
    : path.join(process.cwd(), "/app");

  console.log(readdirSync(appDirPath, { recursive: true }));

  // let layoutFilePath = path.join(process.cwd(), );
  // todo: read directory, if found, generate path relative to read directory
};

const generateFileContent = (ff: Family[], fontsDirPath: string) => {
  const familiesExportsArr = ff.map((family) => {
    return (
      `
    export const ${family.familyName} = localfont({
      \tsrc: ${getFontSrc(family.fonts, fontsDirPath)},
      \tdisplay: "swap",
    })
    `.trim() + "\n"
    );
  });

  return `${familiesExportsArr.join("\n")}\nexport default {
    ${ff.map((f) => f.familyName).join(",\n")}
  }`;
};
