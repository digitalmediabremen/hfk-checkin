import Link from "next/link";
import * as React from "react";
import { appUrls } from "../../config";
import { useTranslation } from "../../localization";
import theme from "../../styles/theme";

interface IFooterProps {}

const Footer: React.FunctionComponent<IFooterProps> = (props) => {
    const { t } = useTranslation();

    return (
        <>
            <style jsx>
                {`
                    .footer {
                        margin-top: ${-theme.footerHeight}px;
                        height: ${theme.footerHeight}px;
                        display: flexbox;
                        align-items: center;
                        padding: 0 ${theme.spacing(3)}px;
                        color: ${theme.primaryColor};
                    }

                    .footer a {
                        margin-right: ${theme.spacing(4)}px;
                    }

                    .footer a:hover {
                        cursor: pointer;
                    }
                `}
            </style>
            <div className="footer">
                <Link href={appUrls.privacy}>
                    <a>{t("Datenschutzinformationen")}</a>
                </Link>
                <Link href={appUrls.help}>
                    <a>{t("Hilfe")}</a>
                </Link>
            </div>
        </>
    );
};

export default Footer;
