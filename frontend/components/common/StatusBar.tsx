import Link from "next/link";
import { useRouter } from "next/router";
import * as React from "react";
import { CSSTransition } from "react-transition-group";
import { appUrls } from "../../config";
import { useTranslation } from "../../localization";
import Profile from "../../model/Profile";
import theme from "../../styles/theme";
import { useAppState } from "./AppStateProvider";
import EllipseText from "./EllipseText";

interface ErrorBarProps {
    profile?: Profile;
}

const StatusBar: React.FunctionComponent<ErrorBarProps> = ({ profile }) => {
    const { appState, dispatch } = useAppState();
    const { status } = appState;
    const [states, setStates] = React.useState<
        Array<{ message: string; isError: boolean; id?: number }>
    >(!!status ? [status] : []);
    const { t } = useTranslation();
    const [timeoutId, setTimeoutId] = React.useState<any>(undefined);
    const router = useRouter();

    React.useEffect(() => {
        if (status) {
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
                    z-index: 200;
                    background: #fff;
                }

                .profile:hover {
                    cursor: pointer;
                }

                .status.error {
                    background-color: ${theme.primaryColor};
                    color: ${theme.secondaryColor};
                    font-weight: bold;
                    z-index: 1000;
                }

                .bar {
                    padding: ${theme.spacing(2)}px ${theme.spacing(3)}px;
                    display: flex;
                    align-items: center;
                }

                .bar .icon {
                    font-size: 1.5em;
                    margin-left: auto;
                    font-weight: bold;
                    width: 1.7em;
                    height: 1.7em;
                    flex-shrink: 0;
                    line-height: 1.5em;
                    text-align: center;
                    border-radius: ${theme.borderRadius}px;
                    border: 2px solid ${theme.primaryColor};
                    transition: transform 0.2s, opacity 0.2s;
                    transform: scale(1);
                    opacity: 1;
                }

                .bar .icon:hover {
                    cursor: pointer;
                }

                .status-bar[data-pathname="/"] .icon {
                    transform: scale(0.8);
                    opacity: 0;
                }

                .status-bar-spacer {
                    width: 100%;

                    //safari fix
                    font-size: 1em;
                    height: calc(${theme.spacing(6)}px + 1.5em + 1px);
                    display: block;
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
            <div className="status-bar-spacer"></div>
            <div className="status-bar" data-pathname={router.pathname}>
                <div className="bar">
                    <>
                        {profile && (
                            <Link href={appUrls.profile}>
                                <span className="profile">
                                    <EllipseText>
                                        <b>
                                            {profile.first_name}{" "}
                                            {profile.last_name}{" "}
                                            {!profile.verified &&
                                                ` (${t("nicht verifiziert")})`}
                                        </b>
                                        <br />
                                        {!!profile.phone && profile.phone}
                                    </EllipseText>
                                </span>
                            </Link>
                        )}
                        {!profile && (
                            <>
                                HFK
                                <br />
                                Checkin
                            </>
                        )}
                    </>
                    <Link href={appUrls.enterCode}>
                        <span className="icon">#</span>
                    </Link>
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
            </div>
        </>
    );
};

export default StatusBar;
