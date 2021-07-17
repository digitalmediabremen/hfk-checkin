import { useEffect, useLayoutEffect, useState } from "react";
import useMedia from "use-media";
import { useAppState } from "../../components/common/AppStateProvider";
import { isClient } from "../../config";
import { ColorScheme } from "../model/Theme";
import useLocalStorage, { useReadLocalStorage } from "./useLocalStorage";

export default function useTheme() {
    const { appState } = useAppState();
    const { theme } = appState;

    return theme;
}

function validateColorScheme(o: any): ColorScheme {
    if (!["light", "dark"].includes(o)) throw "invalid";
    return o;
}

export function useActiveColorScheme() {
    const savedColorSchemeSetting = useReadLocalStorage(
        "scheme",
        validateColorScheme
    );

    const prefersDarkMode = useMedia({ prefersColorScheme: "dark" });
    const colorScheme: ColorScheme =
        savedColorSchemeSetting || (prefersDarkMode ? "dark" : "light");
    const [activeColorScheme, setActiveColorScheme] = useState(colorScheme);

    useEffect(() => {
        setActiveColorScheme(colorScheme);
    }, [colorScheme])

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
