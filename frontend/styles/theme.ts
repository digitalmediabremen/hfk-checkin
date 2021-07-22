import { getPrimaryColor } from "../features";
import Theme, { ColorScheme } from "../src/model/Theme";

const shadeColor = (color: string, u: number): string => {
    const [, r, g, b, a] =
        /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/.exec(
            color
        )!;
    return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(u, 1))})`;
};

const colorPallete: Record<
    ColorScheme,
    {
        primaryColor: string;
        secondaryColor: string;
        disabledColor: string;
    }
> = {
    light: {
        primaryColor: getPrimaryColor("light"),
        secondaryColor: "rgba(255,255,255,1)",
        disabledColor: "rgba(102,102,102,1)"
    }, dark: {
        primaryColor: getPrimaryColor("dark"),
        secondaryColor: "rgba(50,50,50,1)",
        disabledColor: "rgba(160,160,160,1)"
    }
};

const createTheme = (
    isDesktop: boolean,
    isPWA: boolean,
    colorScheme: ColorScheme
): Theme => ({
    ...colorPallete[colorScheme],
    fontSize: isDesktop ? 18 : 16,
    unit: isDesktop ? 9 : 8,
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
    borderRadius: isDesktop ? 6 : 5,
    footerHeight: function () {
        return this.unit * 10;
    },
    desktopWidth: 600,
    isDesktop,
    isPWA,
    colorScheme,
    topBarHeight: function () {
        return this.unit * 8 + this.offsetTopBar;
    },
    offsetTopBar: isPWA ? 0 : 0,
    boxShadow: function () {
        return `0 0 ${this.spacing(1)}px ${this.shadePrimaryColor(0.3)}`;
    },
});

export default createTheme;
