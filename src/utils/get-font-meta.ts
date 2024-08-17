import { getFontFileNames } from "./get-file-names";
import type { Font } from "../helpers/group-fonts-by-family";
import path from "path";

export type Wght =
  | "100"
  | "200"
  | "300"
  | "400"
  | "500"
  | "600"
  | "700"
  | "800"
  | "900"
  | null;

type WghtAnnotation =
  | "Thin"
  | "ExtraLight"
  | "Light"
  | "Regular"
  | "Medium"
  | "SemiBold"
  | "Bold"
  | "ExtraBold"
  | "Black"
  | "Variable";

type Styles = "normal" | "italic" | "oblique";

const wghtsMap: Record<WghtAnnotation, Wght> = {
  Thin: "100",
  ExtraLight: "200",
  Light: "300",
  Regular: "400",
  Medium: "500",
  SemiBold: "600",
  Bold: "700",
  ExtraBold: "800",
  Black: "900",
  Variable: null,
};

// todo: revise impl.
export const getFontWeight = (font: string): Wght => {
  const fontAnnotationString = font
    .trim()
    .split(getFontFileNames([font])[0] as string)[1]
    ?.split(".")[0]
    ?.split("-")[1]
    ?.toLowerCase();
  let fontWeight: Wght = "400";
  for (const [wghtAnnot, wght] of Object.entries(wghtsMap)) {
    if (
      fontAnnotationString?.includes(wghtAnnot.toLowerCase()) &&
      fontAnnotationString.length === wghtAnnot.length
    ) {
      fontWeight = wght;
      break;
    }
  }
  return fontWeight;
};

export const getFontSrc = (fonts: Font[], fontsDirPath: string) => {
  let src;
  if (fonts.length > 1) {
    src = fonts.map((font) => {
      return {
        path: path.relative(fontsDirPath, font.path).replaceAll(path.sep, "/"),
        ...(font.weight && { weight: font.weight }),
        style: font.style,
      };
    });
  } else
    src = path
      .relative(fontsDirPath, fonts[0]?.path as string)
      .replaceAll(path.sep, "/");
  return deSerializeKeys(JSON.stringify(src));
};

/**
 * De-Serialize object keys in a JSON string.
 * @param {string} jsonString - The JSON string to be parsed.
 * @example deSerializeKeys('{"hello":"world"}') // Output: '{hello:"world"}'
 */
//? Doesn't work on deeply nested objects(yet)??
const deSerializeKeys = (jsonString: string) => {
  const jsonObj = JSON.parse(jsonString);
  if (typeof jsonObj !== "undefined" && typeof jsonObj !== "string") {
    return jsonString
      .split(",")
      .map((token) => {
        const [key, value] = token.split(":");
        return `${key?.replaceAll('"', "")}:${value}`;
      })
      .join(",");
  }
  return jsonString;
};

export const getFontStyle = () => {};
export const getFontVarName = () => {};
