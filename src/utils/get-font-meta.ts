import path from "path";
import type { Font } from "../helpers/group-fonts-by-family";
import { dsr } from "dsr-kv";
import { getTypeface } from "./get-file-names";

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

type Styles = "normal" | "italic" | "oblique" | "Condensed";

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
  const typeface = getTypeface(font);
  // extract part of file containing font weight: `Inter-Bold.otf -> Bold`
  const fontWeightAnnot = font
    .trim()
    .split(typeface)[1]
    ?.split(".")[0]
    ?.split("-")[1]
    ?.toLowerCase();
  let fontWeight: Wght = "400";
  for (const [wghtAnnot, wght] of Object.entries(wghtsMap)) {
    if (
      fontWeightAnnot?.includes(wghtAnnot.toLowerCase()) &&
      fontWeightAnnot.length === wghtAnnot.length
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
  return dsr(JSON.stringify(src));
};

export const getFontVarName = (type: string) => {
  // --font-{font-name}-{font-property}
  const prefix = `--font-`;
  const typeClasses = ["mono", "sans", "serif", "display", "script"];
  const typeface = type.toLowerCase();

  for (const typeClass of typeClasses) {
    if (typeface.includes(typeClass)) {
      return prefix + typeface.split(typeClass).join("-") + typeClass;
    }
  }
  return prefix + typeface;
};

/**
 * Checks if a font is a variable font
 * @function isVariableFont
 * @returns {boolean} Returns true if the font is a variable font, false otherwise
 */
export const isVariableFont = (font: string) => {};
