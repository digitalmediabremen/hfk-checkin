import { getPrimaryColor } from "../features";
import Theme from "../src/model/Theme";

const shadeColor = (color: string, u: number): string => {
    const [
        ,
        r,
        g,
        b,
        a,
    ] = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/.exec(
        color
    )!;
    return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(u, 1))})`;
};

const createTheme = (unit: number = 8, fontSize: number = 16): Theme => ({
    fontSize,
    unit,
    spacing: function (u: number) {
        return u * this.unit;
    },
    shadePrimaryColor: function (u: number) {
        return shadeColor(this.primaryColor, u);
    },
    shadeSecondaryColor: function (u: number) {
        return shadeColor(this.secondaryColor, u);
    },
    shadeDisabledColor: function (u: number) {
        return shadeColor(this.disabledColor, u);
    },
    borderRadius: 5,
    primaryColor: getPrimaryColor(),
    secondaryColor: "rgba(255, 255, 255, 1)",
    disabledColor: "rgba(102,102,102,1)",
    footerHeight: function () {
        return this.unit * 7;
    },
    topBarHeight: function () {
        return this.unit * 10;
    },
    offsetTopBar: 16,
    boxShadow: function () {
        return `0 0 ${this.spacing(1)}px ${this.shadePrimaryColor(0.3)}`;
    },
});

export default createTheme;
