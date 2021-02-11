import { useRouter } from "next/router";
import * as React from "react";
import { useAppState } from "../components/common/AppStateProvider";
import { Button } from "../components/common/Button";
import LastCheckins from "../components/common/LastCheckinsList";
import Notice from "../components/common/Notice";
import AlignContent from "../components/common/AlignContent";
import Subtitle from "../components/common/Subtitle";
import { appUrls } from "../config";
import theme from "../styles/theme";
import needsProfile from "../components/api/needsProfile";
import Profile from "../model/Profile";
import { useTranslation } from "../localization";
import { DotPulse, LoadingInline } from "../components/common/Loading";
import showIf from "../components/api/showIf";
import features from "../features";
import Layout from "../components/common/Page";

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
        if (profileUpdating) return;
        if (!checkin) return;
        if (!checkin.is_active) return;
        const { id: checkinId } = checkin;
        router.push(...appUrls.checkout(checkinId));
    };

    return (
        <Layout>
            <style jsx>{`
                .button-group {
                    margin-top: ${theme.spacing(2)}px;
                    width: 100%;
                }
            `}</style>
            <Subtitle>
                {t("Protokoll")} <LoadingInline loading={profileUpdating} />
            </Subtitle>

            {hasCheckins && (
                <LastCheckins
                    interactive={true}
                    onCheckinClick={handleCheckinClick}
                    checkins={last_checkins}
                    groupByDate
                    showCheckoutSeperatly
                    extendInteractableWidth
                />
            )}
            {!hasCheckins && (
                <Notice>{t("Noch keine Checkins vorhanden")}</Notice>
            )}
            <AlignContent offsetBottomPadding>
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
            </AlignContent>
        </Layout>
    );
};

export default showIf(() => features.checkin || true, needsProfile(ProfilePage));
