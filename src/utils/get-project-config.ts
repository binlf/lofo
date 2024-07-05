import fs from "fs-extra";
import { getFontsDir } from "../helpers/get-fonts-dir";
import { fileExists } from "./exists";
import { LOFO_CONFIG, NEXT_LOCAL_FONTS_DOCS } from "../constants";
import { type PackageJson as PkgJson } from "type-fest";
import { logger } from "./logger";

type LofoConfig = {
  fontsDirPath: string;
  reachedSuccess: boolean;
} & PkgJson;

export const getProjectConfig = () => {
  const packageJSON: PkgJson = fs.readJSONSync("./package.json");
  const projectName = packageJSON.name;
  //  todo: get project import alias for writing font imports
  const importAlias = "";
  let fontsDirPath = getFontsDir();
  const isTwProject = false;
  return { projectName, fontsDirPath, importAlias, isTwProject };
};

export const getLofoConfig = () => {
  // todo: add lofo-config file to .gitignore
  const lofoConfigPath = `./${LOFO_CONFIG}`;
  const shouldUpdateImports = (fontsDirPath: string) => {
    if (fileExists(lofoConfigPath) && fontsDirPath) {
      const { fontsDirPath: _fontsDirPath, reachedSuccess } = fs.readJSONSync(
        lofoConfigPath
      ) as LofoConfig;
      if (!reachedSuccess) return;
      if (_fontsDirPath && fontsDirPath !== _fontsDirPath) {
        fs.writeJSONSync(
          lofoConfigPath,
          { fontsDirPath, reachedSuccess },
          { spaces: 2 }
        );
      }
      return true;
    }
    fs.outputJSONSync(
      lofoConfigPath,
      { fontsDirPath, reachedSuccess: false },
      { spaces: 2 }
    );
    return false;
  };
  const reachedSuccess = () => {
    const lofoConfig = fs.readJSONSync(lofoConfigPath) as LofoConfig;
    if (!lofoConfig.reachedSuccess)
      return fs.writeJSONSync(
        lofoConfigPath,
        { ...lofoConfig, reachedSuccess: true },
        { spaces: 2 }
      );
    logger.success("Added local fonts to your projects successfully...");
    logger.info(
      `Stuck? Check out the Next.js docs for next steps: ${NEXT_LOCAL_FONTS_DOCS}`
    );
  };

  return { shouldUpdateImports, reachedSuccess };
};
