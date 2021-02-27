import { useAppState } from "../../components/common/AppStateProvider";


export default function useStatus() {
    const {appState, dispatch} = useAppState();

    return {
        setError: (message: string) => dispatch({
            type: "status",
            status: {
                isError: true,
                message
            }
        }),
        setNotice: (message: string) => dispatch({
            type: "status",
            status: {
                isError: false,
                message
            }
        })
    }
}