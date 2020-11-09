import { AllHTMLAttributes } from "react";

const unit = 8;

const theme = {
    spacing: (u: number) => u * unit,
    shadePrimaryColor: (u: number) => `rgba(216, 24, 48,${Math.max(0, Math.min(u, 255))})`,
    borderRadius: 5,
    primaryColor: "rgba(216, 24, 48, 100)",
    secondaryColor: "rgba(255, 255, 255, 100)",
    textColor: "rgba(216, 24, 48, 100)",
    disabledColor: "#666",
    footerHeight: unit * 7,
}

export default theme;