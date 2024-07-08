import fs from "fs-extra";
import { fileExists } from "./exists";
import { LOFO_CONFIG, NEXT_LOCAL_FONTS_DOCS } from "../constants";
import { type PackageJson as PkgJson, type TsConfigJson } from "type-fest";
import { logger } from "./logger";

type LofoConfig = {
  fontsDirPath: string;
  reachedSuccess: boolean;
} & PkgJson;

let FONTS_DIR_PATH = "";

export const getProjectConfig = () => {
  const packageJSON: PkgJson = fs.readJSONSync("./package.json");
  const projectName = packageJSON.name;
  const { alias: importAlias, isTwProject } = getProjectMeta();
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

const getProjectMeta = () => {
  const isTwProject = fileExists("./tailwind.config.ts");
  try {
    const tsConfigFile = fs.readJSONSync("./tsconfig.json") as TsConfigJson;
    const paths = tsConfigFile.compilerOptions?.paths;
    const alias =
      paths &&
      Object.entries(paths).reduce((acc, [alias, paths]) => {
        if (!acc && paths.filter((path) => path.indexOf("./") === 0).length > 0)
          return alias;
        return acc;
      }, "");
    return { alias, isTwProject };
  } catch (error: any) {
    if (error.code === "ENOENT")
      logger.error("Couldn't find your tsconfig file...");
    console.log(error);
    // todo: type this properly
    return {};
  }
};
