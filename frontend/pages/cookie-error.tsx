import { error } from "console";
import React from "react";
import { Meh } from "react-feather";
import Layout from "../components/common/Layout";
import Notice from "../components/common/Notice";
import Title from "../components/common/Title";
import { getTitle } from "../features";
import { useTranslation } from "../localization";
import useTheme from "../src/hooks/useTheme";

const CookieErrorPage = () => {
    const theme = useTheme();
    const { t } = useTranslation("cookieError");
    return (
        <Layout>
            <Meh
                color={theme.primaryColor}
                size={64}
                strokeWidth={(24 / 64) * 2}
            />
            <br />
            <br />
            <Title>{t("Es gibt ein Cookie Problem.")}</Title>
            <Notice>
                {t("Mögliche Fehlerquellen:")}
                <ul>
                    <li style={{ marginBottom: `${theme.spacing(1)}px` }}>
                        {t("Du benutzt den Incognito-Modus deines Browsers:")}
                        <br />
                        <b>
                            {t("Aktuell unterstützt {appname} diesen nicht.", {
                                appname: getTitle(),
                            })}
                        </b>
                    </li>
                    <li>
                        {t(
                            "Du hast Cookies in deinen Browsereinstellung deaktiviert:"
                        )}
                        <br />
                        <b>
                            {t(
                                "Du musst Cookies zulassen um {appname} nutzen zu können.",
                                { appname: getTitle() }
                            )}
                        </b>
                    </li>
                </ul>
                {t("Melde dich bei")}{" "}
                <u>
                    <a href="mailto:checkin@hfk-bremen.de">
                        checkin@hfk-bremen.de
                    </a>
                </u>{" "}
                {t("wenn dieser Fehler häufiger auftritt.")}
            </Notice>
            {/* {error && <pre>{error}</pre>} */}
        </Layout>
    );
};

export default CookieErrorPage;
