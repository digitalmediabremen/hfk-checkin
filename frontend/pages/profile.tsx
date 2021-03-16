import { useRouter } from "next/router";
import * as React from "react";
import needsProfile from "../components/api/needsProfile";
import showIf from "../components/api/showIf";
import AlignContent from "../components/common/AlignContent";
import { Button } from "../components/common/Button";
import LastCheckins from "../components/common/LastCheckinsList";
import Layout from "../components/common/Layout";
import { LoadingInline } from "../components/common/Loading";
import Notice from "../components/common/Notice";
import Subtitle from "../components/common/Subtitle";
import { appUrls } from "../config";
import features from "../features";
import { useTranslation } from "../localization";
import useTheme from "../src/hooks/useTheme";
import MyProfile from "../src/model/api/MyProfile";

interface ProfilePageProps {
    profile: MyProfile;
    profileUpdating: boolean;
}

const ProfilePage: React.FunctionComponent<ProfilePageProps> = ({
    profile,
    profileUpdating,
}) => {
    const theme = useTheme();
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
