import { useEffect, useLayoutEffect, useState } from "react";
import useMedia from "use-media";
import { useAppState } from "../../components/common/AppStateProvider";
import { isClient } from "../../config";
import { ColorScheme, validateColorScheme } from "../model/Theme";
import { useReadLocalStorage } from "./useLocalStorage";

export default function useTheme() {
    const { appState } = useAppState();
    const { theme } = appState;

    return theme;
}

function useDefaultColorScheme(): ColorScheme {
    const prefersDarkMode = useMedia({ prefersColorScheme: "dark" });
    return prefersDarkMode ? "dark" : "light";
}

function useActiveColorScheme(): ColorScheme {
    const { appState } = useAppState();
    const overwrittenColorScheme = appState.overwriteColorScheme;

    const defaultColorScheme = useDefaultColorScheme();
    const colorScheme: ColorScheme =
        overwrittenColorScheme === undefined
            ? defaultColorScheme
            : overwrittenColorScheme;
    const [activeColorScheme, setActiveColorScheme] = useState(colorScheme);

    useEffect(() => {
        setActiveColorScheme(colorScheme);
    }, [colorScheme]);

    return activeColorScheme;
}

export function useInitTheme() {
    const { dispatch } = useAppState();
    const isDesktop = useMedia({ minWidth: 600 });
    const isPWA =
        useMedia({ displayMode: "standalone" }) ||
        // @ts-expect-error
        (isClient && window.navigator.standalone === true);
    const colorScheme = useActiveColorScheme();

    useLayoutEffect(() => {
        dispatch({
            type: "updateTheme",
            isDesktop,
            isPWA,
            colorScheme,
        });
    }, [isDesktop, isPWA, colorScheme]);
}

export function useChangeColorScheme() {
    const { appState } = useAppState();
    const { theme } = appState;
}
