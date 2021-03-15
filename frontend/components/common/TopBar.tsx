import React, { ReactNode, useEffect, useState } from "react";
import { AlertCircle } from "react-feather";
import {
    CSSTransition,
    TransitionGroup
} from "react-transition-group";
import useStatus from "../../src/hooks/useStatus";
import useTheme from "../../src/hooks/useTheme";
import Bar from "./Bar";

interface TopBarProps {
    actionProvider?: () => ReactNode;
}

const TopBar: React.FunctionComponent<TopBarProps> = ({
    actionProvider,
    children,
}) => {
    const theme = useTheme();
    const { status, empty } = useStatus();
    const [currentStatus, setCurrentStatus] = useState<
        | {
              isError: boolean;
              message: string;
              id: number;
          }
        | undefined
    >(undefined);

    const remove = () => {
        setCurrentStatus(undefined);
    };

    useEffect(() => {
        if (!currentStatus) return;
        if (currentStatus.isError) return;
        const timer = window.setTimeout(() => {
            setCurrentStatus(undefined);
            console.log("remove")
        }, 2000);
        return () => {
            clearTimeout(timer);
        };
    }, [currentStatus]);

    // delay adding to queue.
    useEffect(() => {
        if (!status) return;
        const timer = window.setTimeout(
            () => {
                setCurrentStatus({
                    ...status,
                    id: Math.random(),
                });
                // clear
                empty();
            },
            currentStatus ? 500 : 0
        );

        return () => clearTimeout(timer);
    }, [status]);

    const duration = 300;

    return (
        <>
            <style jsx>{`
                .status-bar {
                    height: ${theme.topBarHeight() - theme.offsetTopBar}px;
                    color: ${theme.primaryColor};
                    border-bottom: 1px solid ${theme.primaryColor};
                    overflow: visible;
                    position: relative;
                    width: 100%;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: #fff;
                    margin-top: ${theme.offsetTopBar}px;
                }

                .animation {
                    // transform: translateY(-100%);
                    position: absolute;
                    display: block;
                    width: 100vw;
                    height: ${theme.topBarHeight() - theme.offsetTopBar}px;
                    top: 0;
                    left: 0;
                    z-index: 3000;
                    will-change: transform;
                    opacity: 0;
                }

                @keyframes appear {
                    from {
                        opacity: 0;
                        transform: translateY(-100%);
                    }
                    50% {
                        opacity: 0.5;
                        transform: translateY(-50%);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes leave {
                    from {
                        opacity: 1;
                        transform: translateY(0%);
                    }
                    to {
                        opacity: 0;
                        transform: translateY(50%);
                    }
                }

                .status {
                    padding: ${theme.spacing(1)}px ${theme.spacing(1.5)}px;
                    width: 100%;
                    border-radius: 5px;
                    display: flex;
                    align-items: center;
                    text-align: left;
                    box-shadow: ${theme.boxShadow()};
                }

                .status .text {
                    white-space: pre-wrap;
                }

                .status .icon {
                    padding-right: 8px;
                }

                .push-right {
                    margin-left: auto;
                    position: absolute;
                    right: ${theme.spacing(1.5)}px;
                    line-height: 0;
                    // margin-right: -${theme.spacing(1.5)}px;
                }

                .animation.enter-active {
                    animation: appear ${duration}ms linear;
                    animation-fill-mode: forwards;
                }
                .animation.enter-done {
                    transform: translateY(0%);
                    opacity: 1;
                }

                .animation.exit-active {
                    animation: leave ${duration / 2}ms linear;
                    animation-fill-mode: forwards;
                }

                .animation.exit-done {
                    transform: translateY(50%);
                    opacity: 0;
                }

                .status.error {
                    background-color: ${theme.primaryColor};
                    color: ${theme.secondaryColor};
                    font-weight: bold;
                    // z-index: 101;
                }

                :global(.status-wrapper) {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 0;
                    width: 100%;
                }
            `}</style>
            <header className="status-bar">
                <Bar extendedWidth>
                    {children}
                    {!!actionProvider ? (
                        <span className="push-right">{actionProvider()}</span>
                    ) : undefined}
                </Bar>
                <TransitionGroup className="status-wrapper">
                    {currentStatus && (
                        <CSSTransition
                            mountOnEnter
                            unmountOnExit
                            key={currentStatus.id}
                            timeout={duration}
                        >
                            <div className="animation" onClick={() => remove()}>
                                <Bar extendedWidth maxWidth>
                                    <div className="status error">
                                        {currentStatus.isError && (
                                            <span className="icon">
                                                <AlertCircle />
                                            </span>
                                        )}
                                        <span className="text">
                                            {currentStatus.message}
                                        </span>
                                    </div>
                                </Bar>
                                {/* {JSON.stringify(transitionStyles[state])} */}
                            </div>
                        </CSSTransition>
                    )}
                </TransitionGroup>
            </header>
        </>
    );
};

export default TopBar;
