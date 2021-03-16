import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { PlusCircle } from "react-feather";
import { appUrls } from "../../config";
import useTheme from "../../src/hooks/useTheme";

interface NewRequestButtonProps {}

const NewRequestButton: React.FunctionComponent<NewRequestButtonProps> = ({}) => {
    const theme = useTheme();
    const router = useRouter();
    const isHidden = ["/", appUrls.request].includes(router.pathname);
    return (
        <>
            <style jsx>{`
                .icon {
                    transition: transform 0.2s, opacity 0.2s;
                    transform: scale(1);
                    opacity: 1;
                }
                .icon.hidden {
                    transform: scale(0.8);
                    opacity: 0;
                }
            `}</style>
            <Link href={appUrls.request}>
                <a className={classNames("icon", { hidden: isHidden })}>
                    <PlusCircle size={40} strokeWidth={(2 / 40) * 24} />
                </a>
            </Link>
        </>
    );
};

export default NewRequestButton;
