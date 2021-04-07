import classNames from "classnames";
import Link from "next/link";
import React from "react";
import { Menu } from "react-feather";
import { appUrls } from "../../config";
import { getTitle } from "../../features";
import { useTranslation } from "../../localization";
import useTheme from "../../src/hooks/useTheme";
import { useAppState } from "./AppStateProvider";
import Bar from "./Bar";
import EllipseText from "./EllipseText";
import FormElement from "./FormElement";

interface ProfileBarProps {}

const ProfileBar: React.FunctionComponent<ProfileBarProps> = () => {
    const { t } = useTranslation();

    const { appState } = useAppState();
    const profile = appState.myProfile;
    if (!profile) return <NotLoggedInBar />;
    return (
        <Bar extendedWidth>
            <Link href={appUrls.home} passHref>
                <FormElement
                    // adaptiveWidth
                    componentType="a"
                    value={[
                        <b>
                            {profile.first_name} {profile.last_name}{" "}
                            {!profile.verified && `(${t("nicht verifiziert")})`}
                        </b>,
                        <>{!!profile.phone && profile.phone}</>,
                    ]}
                    noOutline
                    labelIcon={<Menu strokeWidth={2} />}
                    noPadding
                    noBottomSpacing
                    narrow
                />
            </Link>
        </Bar>
    );
};

const NotLoggedInBar: React.FunctionComponent<{}> = ({}) => {
    return (
        <Bar>
            <Link href={appUrls.createProfile}>
                <a>
                    <b>{getTitle()}</b>
                </a>
            </Link>
        </Bar>
    );
};

export default ProfileBar;
