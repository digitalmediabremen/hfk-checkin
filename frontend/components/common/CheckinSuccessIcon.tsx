import * as React from "react";
import { Airplay, Check, Clock, Circle, CheckCircle, Icon } from "react-feather";
import useTheme from "../../src/hooks/useTheme";
interface CheckinSucessIconProps {
    icon?: Icon
}

const AnimatedIcon: React.FunctionComponent<CheckinSucessIconProps> = (
    {icon: _icon}
) => {
    const theme = useTheme();
    const Icon = _icon || CheckCircle;
    return (
        <>
            <style jsx>{`
                .icon {
                    display: block;
                    width: 30vw;
                    max-width: 150px;
                    height: 30vw;
                    max-height: 150px;
                    margin: 0 auto;
                    margin-bottom: ${theme.spacing(4)}px;
                    transform: scale(0.9);
                    opacity: 0;
                    animation: appear .3s 1s linear forwards;
                    color: ${theme.primaryColor};
                }

                .icon > :global(svg > polyline), .icon > :global(svg > path) {
                    stroke-dasharray: 100;
                    stroke-dashoffset: -100;
                    animation: dash 1s 0.5s linear forwards;
                }

                .center {
                }

                .center > :global(svg) {

                }

                @keyframes dash {
                    to {
                        stroke-dashoffset: 0;
                    }
                }

                @keyframes appear {
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `}</style>
            <svg
                className="icon"
                width="198px"
                height="198px"
                viewBox="0 0 198 198"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
            >
                    <Icon width="100%" height="100%" strokeWidth=".5" />
                        {/* <Airplay width="70%" height="70%" strokeWidth="1" vectorEffect="non-scaling-stroke" x="15%" y="15%" /> */}
                        {/* <polyline
                            strokeWidth="4"
                            vectorEffect="non-scaling-stroke"
                            id="checkmark"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points="56 97.0130902 83.9869098 125 139.98691 69"
                        ></polyline> */}
                    
            </svg>
        </>
    );
};

export default AnimatedIcon;
