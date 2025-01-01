import fs from "fs-extra";
import { fileExists } from "./exists";
import { LOFO_CONFIG } from "../constants";
import { type PackageJson as PkgJson } from "type-fest";
import { logger } from "./logger";
import path from "path";

type LofoConfig = {
  fontsDirPath: string;
  reachedSuccess: boolean;
  fonts: string[];
} & PkgJson;

let FONTS_DIR_PATH = "";
let fontNames: string[] = [];
let shouldUpdateImports = false;

export const getLofoConfig = () => {
  const CURR_DIR = process.cwd();
  const lofoConfigPath = path.join(CURR_DIR, `${LOFO_CONFIG}`);
  const lofoConfig =
    (fileExists(lofoConfigPath) || undefined) &&
    (fs.readJSONSync(lofoConfigPath) as LofoConfig);

  // todo: didPathChange() should only check if the path has changed
  // it's currently doing unrelated things as well like updating the config file and setting the FONTS_DIR_PATH
  const didPathChange = (fontsDirPath: string) => {
    FONTS_DIR_PATH ||= fontsDirPath;
    try {
      if (lofoConfig && fontsDirPath) {
        const { fontsDirPath: _fontsDirPath, reachedSuccess } = lofoConfig;
        if (!reachedSuccess) return false;
        if (_fontsDirPath && fontsDirPath !== _fontsDirPath) {
          fs.outputJSONSync(
            lofoConfigPath,
            { ...lofoConfig, fontsDirPath },
            { spaces: 2 }
          );
          shouldUpdateImports = true;
          return true;
        }
        return false;
      }
    } catch (error) {
      if (error instanceof Error)
        if ("code" in error && error.code === "ENOENT")
          logger.error("lofo-config.json file is missing...");
      return console.error(error);
    }
  };

  const setDestinationPath = (destPath: string) => (FONTS_DIR_PATH = destPath);
  const updateFonts = (callbackFn: (fonts: string[]) => string[]) => {
    const existingFonts = lofoConfig?.fonts as string[];
    fontNames = callbackFn(existingFonts);
  };

  // todo: split into `writeConfig()` and `updateConfig()`
  const signalSuccess = () => {
    if (!lofoConfig || !lofoConfig.reachedSuccess) {
      fs.outputJSONSync(
        lofoConfigPath,
        {
          fontsDirPath: FONTS_DIR_PATH,
          reachedSuccess: true,
          fonts: fontNames,
        } as LofoConfig,
        { spaces: 2 }
      );
      fs.outputFile("./.gitignore", `\n${LOFO_CONFIG}`, { flag: "a" });
    }
    if (lofoConfig?.reachedSuccess) {
      fs.outputJSONSync(
        lofoConfigPath,
        {
          ...lofoConfig,
          fonts: fontNames,
        } as LofoConfig,
        { spaces: 2 }
      );
    }
  };

  return {
    didPathChange,
    shouldUpdateImports,
    signalSuccess,
    reachedSuccess: Boolean(lofoConfig?.reachedSuccess),
    fonts: lofoConfig?.fonts,
    setDestinationPath,
    destPath: FONTS_DIR_PATH,
    fontsDirPath: lofoConfig?.fontsDirPath,
    updateFonts,
  };
};
