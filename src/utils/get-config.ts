import fs from "fs-extra";
import { fileExists } from "./exists";
import { LOFO_CONFIG, NEXT_LOCAL_FONTS_DOCS } from "../constants";
import { type PackageJson as PkgJson } from "type-fest";
import { logger } from "./logger";

type LofoConfig = {
  fontsDirPath: string;
  reachedSuccess: boolean;
} & PkgJson;

let FONTS_DIR_PATH = "";

export const getProjectConfig = () => {
  const packageJSON: PkgJson = fs.readJSONSync("./package.json");
  const projectName = packageJSON.name;
  //  todo: get project import alias for writing font imports
  const importAlias = "";
  // todo: check if project is using tailwindcss
  const isTwProject = false;
  return { projectName, importAlias, isTwProject };
};

export const getLofoConfig = () => {
  const lofoConfigPath = `./${LOFO_CONFIG}`;
  const shouldUpdateImports = (fontsDirPath: string) => {
    FONTS_DIR_PATH = fontsDirPath;
    try {
      if (fileExists(lofoConfigPath) && fontsDirPath) {
        const { fontsDirPath: _fontsDirPath, reachedSuccess } = fs.readJSONSync(
          lofoConfigPath
        ) as LofoConfig;
        if (!reachedSuccess) return false;
        if (_fontsDirPath && fontsDirPath !== _fontsDirPath) {
          fs.writeJSONSync(
            lofoConfigPath,
            { fontsDirPath, reachedSuccess },
            { spaces: 2 }
          );
          return true;
        }
        return false;
      }
    } catch (error: any) {
      if (error.code === "ENOENT")
        return logger.error("Couldn't find your lofo-config file...");
      console.log(error);
    }
  };
  const reachedSuccess = () => {
    const lofoConfig =
      (fileExists(lofoConfigPath) || undefined) &&
      (fs.readJSONSync(lofoConfigPath) as LofoConfig);
    if (!lofoConfig || !lofoConfig.reachedSuccess) {
      fs.outputJSONSync(
        lofoConfigPath,
        { fontsDirPath: FONTS_DIR_PATH, reachedSuccess: true },
        { spaces: 2 }
      );
      fs.outputFile("./.gitignore", "\nlofo-config.json", { flag: "a" });
    }
    logger.success("Added local fonts to your project successfully...");
    logger.info(
      `Stuck? Check out the Next.js docs for next steps: ${NEXT_LOCAL_FONTS_DOCS}`
    );
    return lofoConfig?.reachedSuccess;
  };

  return { shouldUpdateImports, reachedSuccess };
};
