import { AllHTMLAttributes } from "react";

const unit = 8;

const theme = {
    spacing: (u: number) => u * unit,
    borderRadius: 5,
    primaryColor: "#D81830",
    secondaryColor: "#FFF",
    textColor: "#D81830",
    disabledColor: "#666",
    footerHeight: unit * 7,
}

export default theme;