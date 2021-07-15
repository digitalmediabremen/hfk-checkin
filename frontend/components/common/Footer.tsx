import Link from "next/link";
import * as React from "react";
import { HelpCircle } from "react-feather";
import { appUrls, backendUrl } from "../../config";
import { useTranslation } from "../../localization";
import useTheme from "../../src/hooks/useTheme";
import { useAppState } from "./AppStateProvider";
interface IFooterProps {}

const Footer: React.FunctionComponent<IFooterProps> = (props) => {
    const theme = useTheme();
    const { t } = useTranslation("common");
    const { appState } = useAppState();
    const { myProfile: profile } = appState;

    return (
        <>
            <style jsx>
                {`
                    .footer {
                        margin-top: ${-theme.footerHeight() +
                        theme.spacing(3)}px;
                        height: ${theme.footerHeight() - theme.spacing(3)}px;
                        display: flexbox;
                        align-items: center;
                        padding: 0 ${theme.spacing(3)}px;
                        color: ${theme.primaryColor};
                        position: relative;
                        z-index: 2;
                        overflow: auto;
                    }

                    .footer > a {
                        margin-right: ${theme.spacing(3)}px;
                    }

                    .footer > a > span {
                        white-space: nowrap;
                        line-height: 0;
                    }

                    .footer > a > span > :global(svg) {
                        vertical-align: text-bottom;
                    }

                    .footer a:hover {
                        cursor: pointer;
                    }
                `}
            </style>
            <div className="footer">
                <Link href={appUrls.help}>
                    <a>
                        <span>
                            {t("Hilfe")}{" "}
                            <HelpCircle strokeWidth={(1 / 20) * 24} size={20} />{" "}
                        </span>
                    </a>
                </Link>
                <Link href={appUrls.privacy}>
                    <a>{t("Datenschutz")}</a>
                </Link>
            </div>
        </>
    );
};

export default Footer;
