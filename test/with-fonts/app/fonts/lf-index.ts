import localfont from "next/font/local";

export const GeistMonoVF = localfont({
      	src: "GeistMonoVF.woff",
      	variable: "--font-geist-vfmono",
      	display: "swap",
    })

export const GeistVF = localfont({
      	src: "GeistVF.woff",
      	variable: "--font-geistvf",
      	display: "swap",
    })


export default {
    GeistMonoVF, GeistVF
  }