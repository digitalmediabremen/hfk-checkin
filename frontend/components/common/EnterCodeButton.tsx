import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";
import * as React from "react";
import { appUrls } from "../../config";
import useTheme from "../../src/hooks/useTheme";
interface EnterCodeButtonProps {
}

const EnterCodeButton: React.FunctionComponent<EnterCodeButtonProps> = (
    props
) => {
    const theme = useTheme();
    const router = useRouter();
    const isHidden = ["/", appUrls.enterCode].includes(router.pathname);
    return (
        <>
            <style jsx>{`
                .not-selectable {
                    -webkit-touch-callout: none; /* iOS Safari */
                    -webkit-user-select: none; /* Safari */
                    -khtml-user-select: none; /* Konqueror HTML */
                    -moz-user-select: none; /* Old versions of Firefox */
                    -ms-user-select: none; /* Internet Explorer/Edge */
                    user-select: none;
                }
                .icon {
                    font-size: 1.5rem;
                    margin-left: auto;
                    font-weight: bold;
                    width: 1.7rem;
                    height: 1.7rem;
                    flex-shrink: 0;
                    line-height: 1.5em;
                    text-align: center;
                    border-radius: ${theme.borderRadius}px;
                    border: 2px solid ${theme.primaryColor};
                    transition: transform 0.2s, opacity 0.2s;
                    transform: scale(1);
                    opacity: 1;
                }

                .icon:hover {
                    cursor: pointer;
                }

                .icon.hidden {
                    transform: scale(0.8);
                    opacity: 0;
                }
            `}</style>
            <Link href={appUrls.enterCode}>
                <a className={classNames("icon", "not-selectable", {
                    "hidden": isHidden
                })}>#</a>
            </Link>
        </>
    );
};

export default EnterCodeButton;
