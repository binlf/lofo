import fs from "fs-extra";
import path from "path";
import { type PackageJson } from "type-fest";

export const getPackageInfo = (): PackageJson =>
  fs.readJSONSync(path.join(__dirname, "..", "..", "package.json"));
