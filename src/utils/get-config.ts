import fs from "fs-extra";
import { fileExists } from "./exists";
import { LOFO_CONFIG, NEXT_LOCAL_FONTS_DOCS } from "../constants";
import { type PackageJson as PkgJson, type TsConfigJson } from "type-fest";
import { logger } from "./logger";

type LofoConfig = {
  fontsDirPath: string;
  reachedSuccess: boolean;
  fonts: string[];
} & PkgJson;

let FONTS_DIR_PATH = "";
let fontNames: string[] = [];
let shouldUpdateImports = false;

export const getProjectConfig = () => {
  const packageJSON: PkgJson = fs.readJSONSync("./package.json");
  const projectName = packageJSON.name;
  const { alias: importAlias, isTwProject } = getProjectMeta();
  return { projectName, importAlias, isTwProject };
};

export const getLofoConfig = () => {
  const lofoConfigPath = `./${LOFO_CONFIG}`;
  const lofoConfig =
    (fileExists(lofoConfigPath) || undefined) &&
    (fs.readJSONSync(lofoConfigPath) as LofoConfig);
  const didPathChange = (fontsDirPath: string) => {
    FONTS_DIR_PATH = fontsDirPath;
    try {
      if (lofoConfig && fontsDirPath) {
        const { fontsDirPath: _fontsDirPath, reachedSuccess } = lofoConfig;
        if (!reachedSuccess) return false;
        if (_fontsDirPath && fontsDirPath !== _fontsDirPath) {
          fs.writeJSONSync(
            lofoConfigPath,
            { fontsDirPath, reachedSuccess },
            { spaces: 2 }
          );
          shouldUpdateImports = true;
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

  const setFontNames = (names: string[]) => (fontNames = names);

  // todo: diff the array to handle delete/add case
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
    reachedSuccess: lofoConfig?.reachedSuccess,
    fonts: lofoConfig?.fonts,
    setFontNames,
  };
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
