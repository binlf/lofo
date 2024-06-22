import path from "path";
import fs from "fs";
import { FONTS_DIR_NAME } from "../constants";
import { logger } from "../utils/logger";

export const createFontsDir = () => {
  logger.info(
    `Creating a ${FONTS_DIR_NAME} directory in the root directory of your project...`
  );
  const fontsDirPathInRoot = fs.mkdirSync(
    path.join(process.cwd(), `/${FONTS_DIR_NAME}`),
    { recursive: true }
  );
  logger.info(
    `Created a ${FONTS_DIR_NAME} directory at ${fontsDirPathInRoot}.\nPut all your local font files into the ${FONTS_DIR_NAME} directory and run the cli again...`
  );
};
