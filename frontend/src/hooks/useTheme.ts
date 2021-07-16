import { useEffect } from "react";
import useMedia from "use-media";
import { useAppState } from "../../components/common/AppStateProvider";
import { isClient } from "../../config";
import { ColorScheme } from "../model/Theme";

export default function useTheme() {
    const { appState } = useAppState();
    const { theme } = appState;

    return theme;
}

export function useInitTheme() {
    const { dispatch } = useAppState();
    const isDesktop = useMedia({ minWidth: 600 });
    const isPWA =
        useMedia({ displayMode: "standalone" }) ||
        // @ts-expect-error
        (isClient && window.navigator.standalone === true);

    const prefersDarkMode = useMedia({ prefersColorScheme: "dark" })
    const colorScheme: ColorScheme = prefersDarkMode ? "dark" : "light";

    useEffect(() => {
        dispatch({
            type: "updateTheme",   
            isDesktop,
            isPWA,
            colorScheme
        });
    }, [isDesktop, isPWA]);
}

export function useChangeColorScheme() {
    const { appState } = useAppState();
    const { theme } = appState;
}
