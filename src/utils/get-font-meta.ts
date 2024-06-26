import { getFileNames } from "./get-file-names";

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
  | "variable";

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
  Variable: "variable",
};

export const getFontWeight = (font: string): Wght => {
  const fontAnnotationString = font
    .trim()
    .split(getFileNames([font])[0] as string)[1]
    ?.split(".")[0]
    ?.toLowerCase();
  let fontWeight: Wght = "400";
  for (const [wghtAnnot, wght] of Object.entries(wghtsMap)) {
    if (fontAnnotationString?.includes(wghtAnnot.toLowerCase())) {
      fontWeight = wght;
      break;
    }
  }
  return fontWeight;
};

export const getFontStyle = () => {};
export const getFontVarName = () => {};
