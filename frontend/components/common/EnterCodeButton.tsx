import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";
import * as React from "react";
import { LogIn } from "react-feather";
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
            {/* <Link href={appUrls.enterCode}>
                <a className={classNames("icon", "not-selectable", {
                    "hidden": isHidden
                })}>#</a>
            </Link> */}
            <Link href={appUrls.enterCode}>
                <a className={classNames({ hidden: isHidden })}>
                    <LogIn size={40} strokeWidth={(24 / 40) * 2} />
                </a>
            </Link>
        </>
    );
};

export default EnterCodeButton;
