import fs from "fs-extra";
import { doesFileExist } from "./exists";
import { LOFO_CONFIG } from "../constants";
import { type PackageJson as PkgJson } from "type-fest";
import { logger } from "./logger";
import path from "path";
import { getFontFiles } from "../helpers/get-font-files";
import { getFontsDir } from "../helpers/get-fonts-dir";

type LofoConfig = {
  fontsDirPath: string;
  reachedSuccess: boolean;
  fonts: {
    typefaces: Array<string>;
    length: number;
  };
} & PkgJson;

// let fontsDirPath = "";
let typefaces: string[] = [];
let shouldUpdateImports = false;
let filesLength = 0;

export const getLofoConfig = () => {
  const CURR_DIR = process.cwd();
  const lofoConfigPath = path.join(CURR_DIR, `${LOFO_CONFIG}`);
  const lofoConfig =
    (doesFileExist(lofoConfigPath) || undefined) &&
    (fs.readJSONSync(lofoConfigPath) as LofoConfig);

  // todo: didPathChange() should only check if the path has changed
  // it's currently doing unrelated things as well like updating the config file and setting the FONTS_DIR_PATH
  const didPathChange = (fontsDirPath: string) => {
    fontsDirPath ||= fontsDirPath;
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
          logger.error("Failed to load lofo config...");
      return console.error(error);
    }
  };

  // reconsider using the `getFontsDir` helper to get the fonts directory path as it'd always be up-to-date
  // we might not need to rely on an external "dependency" to set the fonts directory path for us
  // const setFontsDirPath = (path: string) => (fontsDirPath = path);
  const setFilesLength = (length: number) => (filesLength = length);
  // const setDestinationPath = (destPath: string) => (fontsDirPath = destPath);

  const updateTypefaces = (callbackFn: (typefaces: string[]) => string[]) => {
    const oldTypefaces = lofoConfig?.fonts.typefaces;
    typefaces = callbackFn(oldTypefaces || []);
  };

  function writeConfig(): void;
  function writeConfig(callbackFn: (config: LofoConfig) => LofoConfig): void;
  function writeConfig(callbackFn?: (config: LofoConfig) => LofoConfig) {
    const fontsDirPath = getFontsDir();
    const fontFilesLength = getFontFiles(fontsDirPath).length;
    if (!callbackFn) {
      /** create */
      if (!lofoConfig || !lofoConfig.reachedSuccess) {
        fs.outputJSONSync(
          lofoConfigPath,
          {
            fontsDirPath: fontsDirPath,
            reachedSuccess: true,
            fonts: {
              typefaces,
              length: fontFilesLength,
            },
          } as LofoConfig,
          { spaces: 2 }
        );
        fs.outputFile("./.gitignore", `\n${LOFO_CONFIG}`, { flag: "a" });
      }
      /** update */
      if (lofoConfig?.reachedSuccess) {
        fs.outputJSONSync(
          lofoConfigPath,
          {
            ...lofoConfig,
            fontsDirPath,
            fonts: {
              typefaces,
              length: fontFilesLength,
            },
          },
          { spaces: 2 }
        );
      }
    } else {
      fs.outputJSONSync(lofoConfigPath, callbackFn(lofoConfig as LofoConfig));
    }
  }

  return {
    didPathChange,
    shouldUpdateImports,
    writeConfig,
    reachedSuccess: Boolean(lofoConfig?.reachedSuccess),
    fonts: lofoConfig?.fonts,
    setFilesLength,
    fontsDirPath: lofoConfig?.fontsDirPath,
    updateTypefaces,
  };
};
