import fs from "fs-extra";
import { fileExists } from "./exists";
import { LOFO_CONFIG, NEXT_LOCAL_FONTS_DOCS } from "../constants";
import { type PackageJson as PkgJson } from "type-fest";
import { logger } from "./logger";

type LofoConfig = {
  fontsDirPath: string;
  reachedSuccess: boolean;
  fonts: string[];
} & PkgJson;

let FONTS_DIR_PATH = "";
let fontNames: string[] = [];
let shouldUpdateImports = false;

export const getLofoConfig = () => {
  const lofoConfigPath = `./${LOFO_CONFIG}`;
  const lofoConfig =
    (fileExists(lofoConfigPath) || undefined) &&
    (fs.readJSONSync(lofoConfigPath) as LofoConfig);

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

  const setFontNames = (names: string[]) => (fontNames = names);
  const setDestinationPath = (destPath: string) => (FONTS_DIR_PATH = destPath);

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
      fs.outputFile("./.gitignore", "\nlofo-config.json", { flag: "a" });
    }
    if (lofoConfig?.reachedSuccess) {
      fs.outputJSONSync(
        lofoConfigPath,
        {
          ...lofoConfig,
          fonts: Array.from(new Set([...lofoConfig?.fonts!, ...fontNames])),
        } as LofoConfig,
        { spaces: 2 }
      );
    }

    // todo: success message should reflect finished operation
    // todo: (e.g Added 1 font(s) successfully...)
    // todo: (Removed 2 font(s) successfully...)
    logger.success("Added local fonts to your project successfully...");
    logger.info(
      `Stuck? Check out the Next.js docs for next steps: ${NEXT_LOCAL_FONTS_DOCS}`
    );
  };

  return {
    didPathChange,
    shouldUpdateImports,
    signalSuccess,
    reachedSuccess: Boolean(lofoConfig?.reachedSuccess),
    fonts: lofoConfig?.fonts,
    setFontNames,
    setDestinationPath,
    destPath: FONTS_DIR_PATH,
  };
};
