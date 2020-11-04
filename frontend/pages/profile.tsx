import { useRouter } from "next/router";
import * as React from "react";
import { useAppState } from "../components/common/AppStateProvider";
import { Button } from "../components/common/Button";
import LastCheckins from "../components/common/LastCheckinsList";
import Notice from "../components/common/Notice";
import PushToBottom from "../components/common/PushToBottom";
import Subtitle from "../components/common/Subtitle";
import { appUrls } from "../config";
import theme from "../styles/theme";
import needsProfile from "../components/api/needsProfile";
import Profile from "../model/Profile";
import { useTranslation } from "../localization";

interface ProfilePageProps {
    profile: Profile;
    profileUpdating: boolean;
}

const ProfilePage: React.FunctionComponent<ProfilePageProps> = ({
    profile,
    profileUpdating,
}) => {
    const router = useRouter();
    const { last_checkins } = profile!;
    const hasCheckins = last_checkins.length > 0;
    const { t } = useTranslation();

    const handleCheckinClick = (index: number) => {
        const checkin = last_checkins[index];
        if (!checkin) return;
        if (!checkin.is_active) return;
        const { id: checkinId } = checkin;
        router.push(...appUrls.checkout(checkinId));
    };

    return (
        <>
            <style jsx>{`
                .button-group {
                    margin-top: ${theme.spacing(2)}px;
                    width: 100%;
                }
            `}</style>
            {profileUpdating && <Notice>{t("...aktualisiert")}</Notice>}
            {!profileUpdating && <Subtitle>{t("Protokoll")}</Subtitle>}
            {hasCheckins && (
                <LastCheckins
                    onCheckinClick={handleCheckinClick}
                    checkins={last_checkins}
                    groupByDate
                    showCheckoutSeperatly
                />
            )}
            {!hasCheckins && (
                <Notice>{t("Noch keine Checkins vorhanden")}</Notice>
            )}
            <PushToBottom offsetBottomPadding>
                {/* <div className="button-group"> */}
                <Button
                    noBottomMargin
                    outline
                    onClick={() => router.push(appUrls.setprofile)}
                >
                    {t("Telefon ändern")}
                </Button>
                {/* <Button onClick={} outline>
                        Ausloggen
                    </Button> */}
                {/* </div> */}
            </PushToBottom>
        </>
    );
};

export default needsProfile(ProfilePage);
