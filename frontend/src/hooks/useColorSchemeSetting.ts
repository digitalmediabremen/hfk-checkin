import { CommonOptions } from "child_process";
import { useEffect, useState } from "react";
import { useAppState } from "../../components/common/AppStateProvider";
import { ColorScheme } from "../model/Theme";
import useLocalStorage from "./useLocalStorage";

export type ColorSchemeSetting = ColorScheme | "auto";

export default function useColorSchemeSetting(): {
    colorSchemeSetting: ColorSchemeSetting;
    handleColorSchemeSettingChange: (colorScheme: ColorSchemeSetting) => void;
} {
    const { appState, dispatch } = useAppState();
    const colorSchemeSetting = appState.overwriteColorScheme;

    function handleColorSchemeSettingChange(colorScheme: ColorSchemeSetting) {
        const convert = colorScheme === "auto" ? undefined : colorScheme;
        if (convert === colorSchemeSetting) return;
        dispatch({
            type: "overwriteColorScheme",
            colorScheme: convert,
        });
    }

    return {
        colorSchemeSetting:
            colorSchemeSetting === undefined ? "auto" : colorSchemeSetting,
        handleColorSchemeSettingChange,
    };
}
