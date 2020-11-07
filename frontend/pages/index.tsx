import { useRouter } from "next/router";
import { SFC, useCallback, useEffect, useState } from "react";
import { useLocation } from "../components/api/ApiHooks";
import needsProfile from "../components/api/needsProfile";
import { ButtonWithLoading } from "../components/common/Button";
import LocationCodeInput from "../components/common/LocationCodeInput";
import Notice from "../components/common/Notice";
import { appUrls } from "../config";
import { useTranslation } from "../localization";
import Profile from "../model/Profile";
import theme from "../styles/theme";
import Subtitle from "../components/common/Subtitle";

interface CheckInPageProps {
    profile: Profile;
    error?: string;
}

const isValidLocationCode = (locationCode: string) =>
    locationCode.replace(/" "/g, "").length === 4;

const CheckInPage: SFC<CheckInPageProps> = ({ error, profile }) => {
    const [locationCode, setLocationCode] = useState<string>("");
    const { requestLocation, loading, location } = useLocation();
    const router = useRouter();
    const { t } = useTranslation("enterCode");

    // location request
    const handleLocationCodeChange = useCallback((code: string) => {
        if (location !== undefined) return;
        setLocationCode(code);
        const validCode = isValidLocationCode(code);
        if (validCode) {
            requestLocation(code);
        }
    }, []);

    // checkin
    useEffect(() => {
        if (location) {
            router.push(...appUrls.checkin(location.code));
        } else if (!loading) {
            // reset location if not found
            setLocationCode("");
        }
    }, [location, loading]);

    return (
        <>
            <style jsx>{`
                .location-code-container {
                    margin-bottom: ${theme.spacing(6)}px;
                }

                .profile {
                    margin-bottom: ${theme.spacing(10)}px;
                }

                .desc {
                    margin-bottom: ${theme.spacing(3)}px;
                    color: ${theme.primaryColor};
                    display: inline-block;
                    font-style: italic;
                }
            `}</style>
            <Subtitle>{t("Checkin / Checkout")}</Subtitle>
            <Notice>
                {t(
                    "Bitte gib die 4-stellige Nummer des Standortes ein, den du jetzt betrittst oder verlässt."
                )}
            </Notice>

            <div className="location-code-container">
                <LocationCodeInput
                    onChange={handleLocationCodeChange}
                    code={locationCode}
                    disabled={loading}
                ></LocationCodeInput>
            </div>
            <ButtonWithLoading loading={loading} onClick={() => {}}>
                {t("Einchecken")}
            </ButtonWithLoading>
        </>
    );
};

export default needsProfile(CheckInPage);

// export const getServerSideProps: GetServerSideProps = withLocaleProp(
//     async (context) => {
//         // api call
//         const cookie = context.req.headers.cookie!;
//         const empty = { props: {} };

//         const { data: profile, error, status } = await getProfileRequest({
//             cookie,
//         });

//         if (!!error) {
//             return {
//                 props: {
//                     error,
//                     status,
//                 },
//             };
//         }

//         return {
//             props: {
//                 profile,
//             },
//         };
//     }
// );
