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
import { useUpdateProfileAppState } from "../components/api/ApiHooks";
import needsProfile from "../components/api/needsProfile";
import Profile from "../model/Profile";
import { useTranslation } from "../localization";

interface ProfilePageProps {
    profile: Profile;
}

const ProfilePage: React.FunctionComponent<ProfilePageProps> = ({profile}) => {
    const router = useRouter();
    const { last_checkins} = profile!;
    const hasCheckins = last_checkins.length > 0;
    const { loading } = useUpdateProfileAppState();
    const { t } = useTranslation();

    const handleCheckinClick = (index: number) => {
        const checkin = last_checkins[index];
        if (!checkin) return;
        if (!!checkin.time_left) return;
        const { location } = checkin;
        const { code } = location;
        router.push(...appUrls.checkin(code));
    };

    return (
        <>
            <style jsx>{`
                .button-group {
                    margin-top: ${theme.spacing(2)}px;
                    width: 100%;
                }
            `}</style>
            {loading && 
                <Notice>
                    {t("...aktualisiert")}
                </Notice>
            }
            {!loading && <Subtitle>{t("Protokoll")}</Subtitle>}
            {hasCheckins && <LastCheckins onCheckinClick={handleCheckinClick} checkins={last_checkins} />}
            {!hasCheckins && <Notice>{t("Noch keine Checkins vorhanden")}</Notice>}
            <PushToBottom offsetBottomPadding>
                {/* <div className="button-group"> */}
                    <Button noBottomMargin outline onClick={() => router.push(appUrls.setprofile)}>
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
