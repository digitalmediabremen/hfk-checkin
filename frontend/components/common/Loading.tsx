import theme from "../../styles/theme";
import React, { memo, useState, useEffect } from "react";
import AlignContent from "./AlignContent";

export const DotPulse = ({ invertColor }: { invertColor?: boolean }) => {
    const color = invertColor ? theme.secondaryColor : theme.primaryColor;
    return (
        <>
            <style jsx>{`
                /**
                 * ==============================================
                 * Dot Falling
                 * ==============================================
                 */
                .dot-falling {
                    position: relative;
                    left: -9999px;
                    width: 10px;
                    height: 10px;
                    border-radius: 5px;
                    background-color: ${color};
                    color: ${color};
                    box-shadow: 9999px 0 0 0 ${color};
                    animation: dotFalling 1s infinite linear;
                    animation-delay: 0.1s;
                }

                .dot-falling::before,
                .dot-falling::after {
                    content: "";
                    display: inline-block;
                    position: absolute;
                    top: 0;
                }

                .dot-falling::before {
                    width: 10px;
                    height: 10px;
                    border-radius: 5px;
                    background-color: ${color};
                    color: ${color};
                    animation: dotFallingBefore 1s infinite linear;
                    animation-delay: 0s;
                }

                .dot-falling::after {
                    width: 10px;
                    height: 10px;
                    border-radius: 5px;
                    background-color: ${color};
                    color: ${color};
                    animation: dotFallingAfter 1s infinite linear;
                    animation-delay: 0.2s;
                }

                @keyframes dotFalling {
                    0% {
                        box-shadow: 9999px -15px 0 0 ${theme.shadePrimaryColor(0)};
                    }
                    25%,
                    50%,
                    75% {
                        box-shadow: 9999px 0 0 0 ${color};
                    }
                    100% {
                        box-shadow: 9999px 15px 0 0
                            ${theme.shadePrimaryColor(0)};
                    }
                }

                @keyframes dotFallingBefore {
                    0% {
                        box-shadow: 9984px -15px 0 0 ${theme.shadePrimaryColor(0)};
                    }
                    25%,
                    50%,
                    75% {
                        box-shadow: 9984px 0 0 0 ${color};
                    }
                    100% {
                        box-shadow: 9984px 15px 0 0
                            ${theme.shadePrimaryColor(0)};
                    }
                }

                @keyframes dotFallingAfter {
                    0% {
                        box-shadow: 10014px -15px 0 0 ${theme.shadePrimaryColor(0)};
                    }
                    25%,
                    50%,
                    75% {
                        box-shadow: 10014px 0 0 0 ${color};
                    }
                    100% {
                        box-shadow: 10014px 15px 0 0
                            ${theme.shadePrimaryColor(0)};
                    }
                }
            `}</style>
            <div key="loading" className="dot-falling"></div>
        </>
    );
};

export const LoadingInline = ({
    loading,
    ...other
}: {
    loading: boolean;
    invertColor?: boolean;
}) => {
    const showAnimation = useShowAnimation(loading);

    if (showAnimation && loading)
        return (
            <>
                <style jsx>{`
                    span {
                        display: inline-block;
                        position: relative;
                        padding: 0px 1.25rem;
                        transform: scale(0.7);
                    }
                `}</style>
                <span>
                    <DotPulse {...other} />
                </span>
            </>
        );
    return null;
};

interface LoadingProps {
    loading: boolean;
}

const useShowAnimation = (loading: boolean) => {
    const [showAnimation, toggleAnimation] = useState(false);

    useEffect(() => {
        let timer: number;
        const _clear = () => window.clearTimeout(timer);
        if (loading) {
            timer = window.setTimeout(() => {
                toggleAnimation(true);
            }, 500);
        } else {
            toggleAnimation(false);
            _clear();
        }
        return () => _clear();
    }, [loading]);

    return showAnimation;
};

export const LoadingScreen = () => {
    const showAnimation = useShowAnimation(true);
    if (!showAnimation) return null;
    return (
        <AlignContent align="center">
            <DotPulse />
        </AlignContent>
    );
};

const Loading: React.FunctionComponent<LoadingProps> = ({
    children,
    loading,
}) => {
    if (loading) return <LoadingScreen key="loading" />;

    // if (!loadingOnMount) return "wasnt loading on mount"

    return (
        <>
            <style jsx>{`
                .show {
                    will-change: opacity;
                    opacity: 0;
                    animation: show 0.2s linear forwards;
                }

                @keyframes show {
                    0% {
                        opacity: 0;
                    }
                    100% {
                        opacity: 1;
                    }
                }
            `}</style>
            <div className="show">{children}</div>
        </>
    );
};

export default Loading;
