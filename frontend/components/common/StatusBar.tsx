import * as React from "react";
import theme from "../../styles/theme";
import { useAppState } from "./AppStateProvider";
import Profile from "../../model/Profile";
import { useRouter } from "next/router";
import Link from "next/link";
import { CSSTransition } from "react-transition-group";
import { setNestedObjectValues } from "formik";

interface ErrorBarProps {
    profile?: Profile;
}

const StatusBar: React.FunctionComponent<ErrorBarProps> = ({ profile }) => {
    const { appState, dispatch } = useAppState();
    const router = useRouter();
    const { status } = appState;
    const [states, setStates] = React.useState<
        Array<{ message: string; isError: boolean; id?: number }>
    >(!!status ? [status] : []);

    React.useEffect(() => {
        if (status) {
            states.push({ ...status, id: Math.random() });
            setStates(states.slice());
        }
    }, [status]);

    const swap = () => {
        const [, ...rest] = states;
        setStates(rest.slice());
    };

    const handleClose = () => {
        dispatch({
            type: "status",
            status: undefined,
        });
    };

    return (
        <>
            <style jsx>{`
                .status-bar {
                    color: ${theme.primaryColor};
                    border-bottom: 1px solid ${theme.primaryColor};
                    overflow: hidden;
                    position: relative;
                }

                .profile {
                    font-weight: bold;
                }

                .error {
                    background-color: ${theme.primaryColor};
                    color: ${theme.secondaryColor};
                    font-weight: bold;
                    z-index: 1000;
                }

                .bar {
                    padding: ${theme.spacing(2)}px ${theme.spacing(3)}px;
                }

                .status {
                    transition: transform 500ms;
                    transform: translateY(-100%);
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                }
                .status-enter, .status-second-enter {
                    transform: translateY(-100%);
                    transition: none;
                }
                .status-enter-active, .status-second-enter-active  {
                    transform: translateY(0%);
                    transition: transform 300ms;
                }
                .status-enter-done, .status-second-enter-done  {
                    transform: translateY(0%);
                    transition: none;
                }
                .status-exit{
                    transform: translateY(0%);
                    transition: none;
                }
                .status-exit-active {
                    transform: translateY(-100%);
                    transition: transform 300ms;
                }
                .status-second-exit-active {
                    transition: none;
                }
            `}</style>
            <div className="status-bar">
                {profile && (
                    <div className="bar">
                        {/* <span onClick={() => router.back()}>Back</span>{" "}-{" "} */}
                        <span className="profile">
                            {profile.first_name} {profile.last_name}
                        </span>
                        {profile.phone && `(${profile.phone})`}
                    </div>
                )}
                <CSSTransition
                    timeout={300}
                    classNames="status"
                    key={0}
                    in={!!status}
                    onExited={() => setStates([])}
                >
                    <div
                        style={{ zIndex: 1000 }}
                        onClick={handleClose}
                        key="error"
                        className="status error bar"
                    >
                        {states[0]?.message}
                    </div>
                </CSSTransition>
                <CSSTransition
                    timeout={300}
                    classNames="status-second"
                    key={1}
                    in={!!states[1]}
                    onEntered={swap}
                >
                    <div
                        style={{ zIndex: 1000 + 1 }}
                        onClick={handleClose}
                        key="error"
                        className="status error bar"
                    >
                        {states[1]?.message}
                    </div>
                </CSSTransition>
            </div>
        </>
    );
};

export default StatusBar;
