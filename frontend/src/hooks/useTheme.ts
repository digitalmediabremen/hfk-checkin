import { useAppState } from "../../components/common/AppStateProvider";


export default function useTheme() {
    const { appState } = useAppState();

    return appState.theme;
}