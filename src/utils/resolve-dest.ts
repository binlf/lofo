import { pathExistsSync } from "fs-extra";
import { join } from "path";
import { logger } from "./logger";
import { getLofoConfig } from "./get-config";
import { FONTS_DIR_NAME } from "../constants";

export const resolveDestPath = (path: string) => {
  return;
  // const { setDestinationPath } = getLofoConfig();
  // const CURR_DIR = process.cwd();
  // const destPath = join(CURR_DIR, path);
  // try {
  //   if (!pathExistsSync(destPath)) {
  //     throw new Error(`Destination path does not exist: ${destPath}`);
  //   }
  //   setDestinationPath(join(destPath, FONTS_DIR_NAME));
  // } catch (error) {
  //   logger.error(error as string);
  //   process.exit(1);
  // }
};
