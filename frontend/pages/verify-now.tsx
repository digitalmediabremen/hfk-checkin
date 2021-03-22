import * as React from "react";
import { useTranslation } from "../localization";
import Title from "../components/common/Title";
import Text from "../components/common/Text";
import { Button } from "../components/common/Button";
import FormGroup from "../components/common/FormGroup";
import AlignContent from "../components/common/AlignContent";
import { useRouter } from "next/router";
import { appUrls } from "../config";
import Subtitle from "../components/common/Subtitle";
import { useUpdateProfileFromAppStateAndUpdate } from "../components/api/ApiHooks";
import MyProfile from "../src/model/api/MyProfile";
import useTheme from "../src/hooks/useTheme";
import Layout from "../components/common/Layout";
import NewButton from "../components/common/NewButton";
import Link from "next/link";
interface VerifyProfilePageProps {}

const ProfileCenterBig = ({ profile }: { profile: MyProfile }) => {
    const theme = useTheme();
    return (
        <>
            <style jsx>
                {`
                    h3 {
                        color: ${theme.primaryColor};
                        text-align: center;
                        margin: ${theme.spacing(1)}px;
                        font-size: 1.5rem;
                    }

                    div {
                        margin-bottom: ${theme.spacing(3)}px;
                    }
                `}
            </style>
            <div>
                <h3>
                    {profile?.first_name} {profile?.last_name}
                </h3>
                <h3>{profile?.phone}</h3>
                <h3>ID: {profile?.id}</h3>
            </div>
        </>
    );
};

const VerifyNowPage: React.FunctionComponent<VerifyProfilePageProps> = (
    props
) => {
    const { t } = useTranslation("verifyNow");
    const { profile, loading } = useUpdateProfileFromAppStateAndUpdate();
    const router = useRouter();
    return (
        <Layout title={t("Identitätsprüfung")}>
            <Subtitle>{t("Identitätsprüfung")}</Subtitle>
            <Text paragraph>
                {t("Bitte zeige diese Angaben dem Personal am Empfang.")}
            </Text>
            <ProfileCenterBig profile={profile!} />
            <Text paragraph>
                {t(
                    "Sobald die Angaben durch das Personal geprüft und ihrerseits gespeichert wurden, kann der Prozess abgeschlossen werden."
                )}
            </Text>
            <AlignContent offsetBottomPadding>
                <Link href={appUrls.home} passHref>
                    <NewButton componentType="a" noBottomSpacing>
                        {t("Abschliessen")}
                    </NewButton>
                </Link>
            </AlignContent>
        </Layout>
    );
};

export default VerifyNowPage;
