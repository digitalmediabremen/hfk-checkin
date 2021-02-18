import classNames from "classnames";
import Link from "next/link";
import React, { ReactNode } from "react";
import { CSSTransition } from "react-transition-group";
import { appUrls } from "../../config";
import { useTranslation } from "../../localization";
import Profile from "../../model/Profile";
import theme from "../../styles/theme";
import { useAppState } from "./AppStateProvider";
import EllipseText, { className } from "./EllipseText";

interface StatusBarProps {
    action?: () => ReactNode;
}

const StatusBar: React.FunctionComponent<StatusBarProps> = (props) => {
    const { action } = props;
    const { appState, dispatch } = useAppState();
    const { profile, initialized } = appState;
    const { status } = appState;
    const [states, setStates] = React.useState<
        Array<{ message: string; isError: boolean; id?: number }>
    >(!!status ? [status] : []);
    const { t } = useTranslation();
    const [timeoutId, setTimeoutId] = React.useState<any>(undefined);

    React.useEffect(() => {
        if (status) {
            clearTimeout(timeoutId);
            if (!status.isError) {
                const tid = setTimeout(() => {
                    dispatch({ type: "status", status: undefined });
                }, 2000);
                setTimeoutId(tid);
            } else {
                clearTimeout(timeoutId);
            }
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
                    position: fixed;
                    width: 100%;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 10;
                    background: #fff;
                }

                .bar {
                    padding: ${theme.spacing(2)}px ${theme.spacing(3)}px;
                    display: flex;
                    align-items: center;
                    height: ${theme.topBarHeight}px;
                }

                .profile {
                    line-height: 1.3em;
                }

                .status.bar {
                    // overwrite
                    padding: ${theme.spacing(0)}px ${theme.spacing(3)}px;
                    height: 100%;
                }

                .status {
                    background-color: #fff;
                    color: ${theme.primaryColor};
                    transition: transform 500ms;
                    transform: translateY(-100%);
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                }

                .status,
                .status.error {
                    background-color: ${theme.primaryColor};
                    color: ${theme.secondaryColor};
                    font-weight: bold;
                    z-index: 11;
                }

                .status-enter,
                .status-second-enter {
                    transform: translateY(-100%);
                    transition: none;
                }
                .status-enter-active,
                .status-second-enter-active {
                    transform: translateY(0%);
                    transition: transform 300ms;
                }
                .status-enter-done,
                .status-second-enter-done {
                    transform: translateY(0%);
                    transition: none;
                }
                .status-exit {
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
            <header className="status-bar">
                <div className="bar">
                    <>
                        {profile && (
                            <EllipseText>
                                {(ellipsed) => (
                                    <Link href={appUrls.home}>
                                        <a
                                            className={classNames("profile", ellipsed)}
                                        >
                                            <b>
                                                {profile.first_name}{" "}
                                                {profile.last_name}{" "}
                                                {!profile.verified &&
                                                    ` (${t(
                                                        "nicht verifiziert"
                                                    )})`}
                                            </b>
                                            <br />
                                            {!!profile.phone && profile.phone}
                                        </a>
                                    </Link>
                                )}
                            </EllipseText>
                        )}
                        {!profile && initialized && (
                            <Link href={appUrls.home}>
                                <a className="profile">
                                    HfK
                                    <br />
                                    Checkin
                                </a>
                            </Link>
                        )}
                    </>
                    {action?.()}
                </div>

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
                        className={`${
                            states[0]?.isError ? "error" : ""
                        } status bar`}
                    >
                        <span>{states[0]?.message}</span>
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
                        className={`${
                            states[1]?.isError ? "error" : ""
                        } status bar`}
                    >
                        <span>{states[1]?.message}</span>
                    </div>
                </CSSTransition>
            </header>
        </>
    );
};

export default StatusBar;
