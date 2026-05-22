import type { CSSProperties } from "react";

export const brandGradientBorder: CSSProperties = {
    background:
        "linear-gradient(to right, rgb(2, 132, 199), rgb(5, 150, 105), rgb(225, 29, 72)) border-box",
    border: "2px solid transparent",
    WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
    clipPath: "polygon(0px 0px, 100% 0px, 100% 100%, 0px 100%, 0px 0px)",
};
