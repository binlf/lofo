import fs from "fs-extra";
import { type PackageJson } from "type-fest";

export const getPackageInfo = (): PackageJson =>
  fs.readJSONSync("package.json");
