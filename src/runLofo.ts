import { FONTS_DIR_NAME } from "./constants";
import { createFontsDir } from "./helpers/create-fonts-dir";
import { getFontFiles } from "./helpers/get-font-files";
import { getFontsDir } from "./helpers/get-fonts-dir";
import { groupFontsByFamily } from "./helpers/group-fonts-by-family";
import { writeFontImports } from "./helpers/write-font";
import { getLofoConfig } from "./utils/get-config";
import { getProjectConfig, isTwProject } from "./utils/get-project-info";
import { logger } from "./utils/logger";

export const runLofo = async (dest?: string) => {
  const { projectName: PROJECT_NAME } = getProjectConfig();
  const { didPathChange, signalSuccess } = getLofoConfig();
  logger.info(`lofo is running in ${PROJECT_NAME}`);
  //   if (isTwProject()) logger.info("Tailwind Config detected...");
  logger.info(`Getting your ${FONTS_DIR_NAME} directory...`);
  const fontsDirPath = getFontsDir();
  if (!fontsDirPath) {
    logger.warning(
      `A ${FONTS_DIR_NAME} directory was not found in your project...`
    );
    return createFontsDir();
  }
  logger.info(`Found ${FONTS_DIR_NAME} directory at ${fontsDirPath}`);
  if (didPathChange(fontsDirPath)) {
    logger.info("Change to fonts directory path detected. Updating imports...");
    await writeFontImports(fontsDirPath, []);
    return logger.success("Font imports updated...");
  }
  const fontFiles = await getFontFiles(fontsDirPath);
  const fontFamilies = groupFontsByFamily(fontFiles, fontsDirPath);
  await writeFontImports(fontsDirPath, fontFamilies);
  signalSuccess();
};
