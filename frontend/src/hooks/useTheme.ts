import { useAppState } from "../../components/common/AppStateProvider";


export default function useTheme() {
    const { appState } = useAppState();
    const { theme } = appState;

    return theme;
}