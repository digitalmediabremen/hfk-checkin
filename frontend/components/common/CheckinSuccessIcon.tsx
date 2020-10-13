import * as React from "react";
import theme from "../../styles/theme";

interface CheckinSucessIconProps {}

const CheckinSucessIcon: React.FunctionComponent<CheckinSucessIconProps> = (
    props
) => {
    return (
        <>
            <style jsx>{`
                .icon {
                    display: block;
                    width: 10em;
                    height: 10em;
                    margin: 0 auto;
                    margin-bottom: ${theme.spacing(6)}px;
                    transform: scale(0.9);
                    opacity: 0;
                    animation: appear .1s .4s linear forwards;
                }

                #checkmark {
                    stroke-dasharray: 1000;
                    stroke-dashoffset: 1000;
                    animation: dash 1.5s .5s linear forwards;
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
                <g
                    transform="translate(-59.000000, -125.000000)"
                    fill="#fff"
                >
                    <g
                        id="icon"
                        transform="translate(62.000000, 128.000000)"
                        strokeWidth="2"
                        stroke="#D81830"
                    >
                        <circle id="circle" cx="96" cy="96" r="96"></circle>
                        <polyline
                            strokeWidth="4"
                            id="checkmark"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points="56 97.0130902 83.9869098 125 139.98691 69"
                        ></polyline>
                    </g>
                </g>
            </svg>
        </>
    );
};

export default CheckinSucessIcon;
