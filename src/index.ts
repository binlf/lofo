#!/usr/bin/env node

import { logger } from "./utils/logger";
import { FONTS_DIR_NAME } from "./constants";
import { createFontsDir } from "./helpers/create-fonts-dir";
import { groupFontsByFamily } from "./helpers/group-fonts-by-family";
import { getFontFiles } from "./helpers/get-font-files";
import { writeFontImports } from "./helpers/write-font";
import { getLofoConfig, getProjectConfig } from "./utils/get-config";
import { getFontsDir } from "./helpers/get-fonts-dir";

// const program = new Command();

//? entry point
const main = async () => {
  const {
    projectName: PROJECT_NAME,
    importAlias,
    isTwProject,
  } = getProjectConfig();
  const { shouldUpdateImports, signalSuccess } = getLofoConfig();
  logger.info(`lofo is running in ${PROJECT_NAME}`);
  if (isTwProject) logger.info("Tailwind Config detected...");
  logger.info(`Getting your ${FONTS_DIR_NAME} directory...`);
  // get fonts directory
  const fontsDirPath = getFontsDir();
  if (!fontsDirPath) {
    logger.warning(
      `A ${FONTS_DIR_NAME} directory was not found in your project...`
    );
    return createFontsDir();
  }
  logger.info(`Found ${FONTS_DIR_NAME} directory at ${fontsDirPath}`);
  if (shouldUpdateImports(fontsDirPath))
    logger.info("Change to fonts directory detected. Updating paths...");

  const fontFiles = await getFontFiles(fontsDirPath);
  // todo: find a way to implicitly get `fontsDirPath` inside here
  console.log("All Font Files: ", fontFiles);
  // const fontFamilies = groupFontsByFamily(fontFiles, fontsDirPath);
  // console.log("Fams: ", fontFamilies, fontFamilies[0]?.fonts);
  // await writeFontImports(fontsDirPath, fontFamilies, importAlias);
  // signalSuccess(fontFamilies.map((family) => family.familyName));
};

main();
