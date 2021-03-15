import classNames from "classnames";
import { profile } from "console";
import Link from "next/link";
import React from "react";
import { Menu } from "react-feather";
import { appUrls } from "../../config";
import { useTranslation } from "../../localization";
import useTheme from "../../src/hooks/useTheme";
import MyProfile from "../../src/model/api/MyProfile";
import { useUpdateProfileFromAppStateAndUpdate } from "../api/ApiHooks";
import { useAppState } from "./AppStateProvider";
import EllipseText from "./EllipseText";

interface ProfileBarProps {}

const ProfileBar: React.FunctionComponent<ProfileBarProps> = () => {
    const { t } = useTranslation();
    const theme = useTheme();

    const { appState } = useAppState();
    const profile = appState.myProfile;
    if (!profile) return <NotLoggedInBar />;
    return (
        <Link href={appUrls.home}>
            <a style={{ display: "flex", alignItems: "center", width: "calc(100% - 50px)" }}>
                <span
                    style={{
                        width: `${theme.spacing(4)}px`,
                        textAlign: "left",
                        lineHeight: 0,
                    }}
                >
                    <Menu strokeWidth={2} />
                </span>
                <EllipseText>
                    {(ellipsed) => (
                        <span className={classNames(ellipsed)}>
                            <b>
                                {profile.first_name} {profile.last_name}{" "}
                                {!profile.verified &&
                                    ` (${t("nicht verifiziert")})`}
                            </b>
                            <br />
                            {!!profile.phone && profile.phone}
                        </span>
                    )}
                </EllipseText>
            </a>
        </Link>
    );
};

const NotLoggedInBar: React.FunctionComponent<{}> = ({}) => {
    return (
        <>
            <Link href={appUrls.home}>
                <a className="profile">
                    HfK
                    <br />
                    Checkin
                </a>
            </Link>
        </>
    );
};

export default ProfileBar;
