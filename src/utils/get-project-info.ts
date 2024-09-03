import path from "path";
import fs, { pathExistsSync } from "fs-extra";
import { PackageJson, TsConfigJson } from "type-fest";
import { fileExists, folderExists } from "./exists";
import { logger } from "./logger";

const CURR_DIR = process.cwd();

export const getProjectConfig = () => {
  const projectConfigJsonPath = path.join(CURR_DIR, "package.json");
  const projectConfigJson = fs.readJSONSync(
    projectConfigJsonPath
  ) as PackageJson;

  const alias = isTypescriptProject() ? getImportAlias() : null;

  return { projectName: projectConfigJson.name, importAlias: alias };
};

export function getTsConfig() {
  try {
    const tsconfigPath = path.join("tsconfig.json");
    const tsconfig = fs.readJSONSync(tsconfigPath) as TsConfigJson;

    if (!tsconfig) {
      throw new Error("tsconfig.json is missing");
    }

    return tsconfig;
  } catch (error) {
    return null;
  }
}

export const getImportAlias = () => {
  const tsConfig = getTsConfig();
  const paths = tsConfig?.compilerOptions?.paths;
  const importAlias =
    paths &&
    Object.entries(paths).reduce((acc, [alias, paths]) => {
      if (!acc && paths.filter((path) => path.indexOf("./") === 0).length > 0)
        return alias;
      return acc;
    }, "");

  return importAlias;
};

export const getLayoutFile = () => {
  try {
    const srcDir = path.join(CURR_DIR, "/src");
    const appDirPath = folderExists(srcDir)
      ? path.join(srcDir, "/app")
      : path.join(CURR_DIR, "/app");
    if (!appDirPath)
      throw new Error(
        "App directory is missing. Make sure your project is using Next.js app router"
      );
    const [layoutFile] = fs
      .readdirSync(appDirPath, { recursive: true })
      .filter(
        (item) =>
          fileExists(path.join(appDirPath, item as string)) &&
          item.includes("layout")
      ) as string[];
    // todo: revise impl.
    if (!layoutFile)
      throw new Error(
        "Root layout file is missing. Make sure you're using Next.js version 13 or later and using the app router."
      );
    return path.join(appDirPath, layoutFile);
  } catch (error) {
    logger.error(error as string);
    process.exit(1);
  }
};

export const isTwProject = () => {
  const twConfigFileName = "tailwindcss.config";
  const twConfigFile = twConfigFileName + isTypescriptProject() ? ".ts" : ".js";
  return pathExistsSync(path.join(CURR_DIR, twConfigFile));
};

const isTypescriptProject = () =>
  pathExistsSync(path.join(CURR_DIR, "tsconfig.json"));
