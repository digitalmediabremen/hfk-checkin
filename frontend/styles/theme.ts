import features, { getPrimaryColor } from "../features";
import { AllHTMLAttributes } from "react";

const unit = 8;

const shadePrimaryColor = (color: string, u: number): string => {
    const [,r,g,b,a] = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/.exec(color)!;
    return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(u, 1))})`;
}

const theme = {
    spacing: (u: number) => u * unit,
    shadePrimaryColor: function (u: number) { return shadePrimaryColor(this.primaryColor, u)},
    borderRadius: 5,
    primaryColor: getPrimaryColor(),
    secondaryColor: "rgba(255, 255, 255, 1)",
    disabledColor: "#666",
    footerHeight: unit * 7,
}

export default theme;