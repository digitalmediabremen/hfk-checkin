
interface Theme {
    fontSize: number;
    unit: number;
    spacing: (u: number) => number;
    primaryColor: string;
    secondaryColor: string;
    disabledColor: string;
    shadePrimaryColor: (u: number) => string;
    shadeSecondaryColor: (u: number) => string;
    shadeDisabledColor: (u: number) => string;
    borderRadius: number;
    footerHeight: () => number;
    topBarHeight: () => number;
    desktopWidth: number;
    offsetTopBar: number;
    boxShadow: () => string;
}

type ReadonlyTheme = Readonly<Theme>;

export default ReadonlyTheme;