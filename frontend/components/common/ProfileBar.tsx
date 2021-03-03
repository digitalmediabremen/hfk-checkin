import classNames from "classnames";
import { profile } from "console";
import Link from "next/link";
import React from "react";
import { appUrls } from "../../config";
import { useTranslation } from "../../localization";
import MyProfile from "../../src/model/api/MyProfile";
import { useUpdateProfileFromAppStateAndUpdate } from "../api/ApiHooks";
import { useAppState } from "./AppStateProvider";
import EllipseText from "./EllipseText";

interface ProfileBarProps {
}

const ProfileBar: React.FunctionComponent<ProfileBarProps> = () => {
    const { t } = useTranslation();

    const {appState} = useAppState();
    const profile = appState.myProfile;
    if (!profile) return <NotLoggedInBar />;
    return (
        <>
            <style jsx>{``}</style>
            <EllipseText>
                {(ellipsed) => (
                    <Link href={appUrls.home}>
                        <a className={classNames("profile", ellipsed)}>
                            <b>
                                {profile.first_name} {profile.last_name}{" "}
                                {!profile.verified &&
                                    ` (${t("nicht verifiziert")})`}
                            </b>
                            <br />
                            {!!profile.phone && profile.phone}
                        </a>
                    </Link>
                )}
            </EllipseText>
        </>
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
