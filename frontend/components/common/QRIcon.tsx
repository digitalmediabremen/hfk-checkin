import useTheme from "../../src/hooks/useTheme";

const QRIcon = () => {
    const theme = useTheme();
    return (
        <svg
            width="37px"
            height="59px"
            viewBox="0 0 37 59"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
        >
            <g
                id="Mobile-App"
                stroke="none"
                strokeWidth="1"
                fill="none"
                fillRule="evenodd"
            >
                <g
                    id="Checkin-Manual"
                    transform="translate(-33.000000, -340.000000)"
                    stroke={theme.primaryColor}
                >
                    <g
                        id="Group-6-Copy"
                        transform="translate(34.000000, 341.000000)"
                    >
                        <rect
                            id="Rectangle"
                            x="0"
                            y="0"
                            width="8"
                            height="8"
                        ></rect>
                        <g
                            id="Group-5"
                            transform="translate(17.000000, 25.000000)"
                        >
                            <rect
                                id="Rectangle-Copy-62"
                                strokeWidth="2"
                                x="0"
                                y="0"
                                width="18"
                                height="32"
                                rx="2"
                            ></rect>
                            <path
                                d="M6,27 L11.25,27"
                                id="Line-6"
                                strokeLinecap="round"
                            ></path>
                            <polyline
                                id="Path-2-Copy"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points="6 11.5007013 7.66614713 13 11 10"
                            ></polyline>
                        </g>
                        <rect
                            id="Rectangle-Copy-61"
                            fill={theme.primaryColor}
                            x="2"
                            y="2"
                            width="4"
                            height="4"
                        ></rect>
                        <path
                            d="M11.5,2.5 L18.5,20.5"
                            id="Line-7"
                            strokeLinecap="round"
                        ></path>
                        <path
                            d="M3.5,13.5 L13.5,25.5"
                            id="Line-8"
                            strokeLinecap="round"
                        ></path>
                    </g>
                </g>
            </g>
        </svg>
    );
};

export default QRIcon;
