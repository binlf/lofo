import { writeLineBy } from "../src/utils/write-file";
import path from "path";

const constantsFilePath = path.join(process.cwd(), "src", "constants.ts");
writeLineBy(
  constantsFilePath,
  'export const ENV: "prod" | "dev" = "dev";',
  (_, currentLine) => currentLine.includes("ENV")
);
