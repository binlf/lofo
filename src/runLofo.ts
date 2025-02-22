import { move } from "fs-extra";
import { FONTS_DIR_NAME } from "./constants";
import { createFontsDir } from "./helpers/create-fonts-dir";
import { getFontFiles } from "./helpers/get-font-files";
import { getFontsDir } from "./helpers/get-fonts-dir";
import { groupFontsByFamily } from "./helpers/group-fonts-by-family";
import { writeFontImports } from "./helpers/write-font";
import { getLofoConfig } from "./utils/get-config";
import { getProjectConfig } from "./utils/get-project-info";
import { gray, logger } from "./utils/logger";
import { resolveDestPath } from "./utils/resolve-dest";
import path from "path";
import { greenBright, whiteBright } from "picocolors";

export const runLofo = async (dest?: string) => {
  const { projectName: PROJECT_NAME, importAlias } = getProjectConfig();
  const { didPathChange, writeConfig, fonts, setFilesLength } = getLofoConfig();
  const fontsDirPath = getFontsDir();
  dest && resolveDestPath(dest);

  logger.nominal(`${gray("lofo is running in")} ${whiteBright(PROJECT_NAME!)}`);
  if (!fontsDirPath) {
    logger.warning(
      `A ${FONTS_DIR_NAME} directory was not found in your project...`
    );
    return createFontsDir();
  }
  logger.nominal(`${gray("Fonts directory:")} ${whiteBright(fontsDirPath)}`);
  importAlias &&
    logger.nominal(
      `${gray("Project import alias:")} ${whiteBright(importAlias)}`
    );

  // const fontFilePaths = getFontFiles(fontsDirPath);
  console.log(getFontFiles(fontsDirPath));
  return;
  // setFilesLength(fontFilePaths.length);

  const shouldAddFonts = (fonts?.length || 0) < fontFilePaths.length;
  if (!shouldAddFonts) {
    return logger.info("Add a font file to your project and try again");
  }
  const fontFamilies = groupFontsByFamily(fontFilePaths, fontsDirPath);
  await writeFontImports(fontsDirPath, fontFamilies);

  // todo: implement recovery incase operation fails at this point
  // dest &&
  //   (await move(
  //     fontsDirPath,
  //     path.resolve(process.cwd(), dest, FONTS_DIR_NAME),
  //     { overwrite: true }
  //   ));

  writeConfig();
  logger.success("Added Font(s)");
  const addedFilesCount = fontFilePaths.length - fonts?.length!;
  fontFilePaths.slice(-addedFilesCount).map((filePath) => {
    console.log(`\t${greenBright("+")} ${path.basename(filePath)}`);
  });
};
