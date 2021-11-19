import { useEffect, useLayoutEffect, useState } from "react";
import useMedia, { useMediaLayout } from "use-media";
import { useAppState } from "../../components/common/AppStateProvider";
import { isClient, isServer } from "../../config";
import { ColorScheme, validateColorScheme } from "../model/Theme";
import { useReadLocalStorage } from "./useLocalStorage";

export default function useTheme() {
    const { appState } = useAppState();
    const { theme } = appState;

    return theme;
}

function useDefaultColorScheme(): ColorScheme | undefined {
    // hack here
    const [clientMatched, setClientMatched] = useState<ColorScheme | undefined>(undefined);

    useEffect(() => {
        if (isServer) return;
        const match = Boolean(window.matchMedia("(prefers-color-scheme: dark)").matches)
        setClientMatched(match ? "dark" : "light");
    }, [])

    return clientMatched;
}

function useActiveColorScheme(): ColorScheme | undefined {
    const { appState } = useAppState();
    const overwrittenColorScheme = appState.overwriteColorScheme;

    const defaultColorScheme = useDefaultColorScheme();
    const colorScheme: ColorScheme | undefined =
        overwrittenColorScheme === undefined
            ? defaultColorScheme
            : overwrittenColorScheme;

    return colorScheme;
}

export function useInitTheme() {
    const [themeInitialized, setThemeInitialized] = useState(false);
    const { dispatch } = useAppState();
    const isDesktop = useMedia({ minWidth: 600 });
    const isPWA =
        useMedia({ displayMode: "standalone" }) ||
        // @ts-expect-error
        (isClient && window.navigator.standalone === true);
    const colorScheme = useActiveColorScheme();

    useEffect(() => {
        if (colorScheme) {
            dispatch({
                type: "updateTheme",
                isDesktop,
                isPWA,
                colorScheme,
            });
            setThemeInitialized(true);
        }
    }, [isDesktop, isPWA, colorScheme]);

    return themeInitialized;
}

export function useChangeColorScheme() {
    const { appState } = useAppState();
    const { theme } = appState;
}
