import Head from "next/head";
import { GetServerSideProps } from "next";
import { profile } from "console";
import {
    getProfileRequest,
    redirectServerSide,
} from "../components/api/ApiService";
import { useState, SFC, useCallback, useEffect } from "react";
import Profile from "../model/Profile";
import LocationCodeInput from "../components/common/LocationCodeInput";
import { useCheckin, useLocation } from "../components/api/ApiHooks";
import theme from "../styles/theme";
import { useRouter } from "next/router";
import Subtitle from "../components/common/Subtitle";
import { Button, ButtonWithLoading } from "../components/common/Button";
import Notice from "../components/common/Notice";
import { appUrls, httpStatuses } from "../config";
import { withLocaleProp, useTranslation } from "../localization";

interface CheckInPageProps {
    profile?: Profile;
    error?: string;
}

const isValidLocationCode = (locationCode: string) =>
    parseInt(locationCode).toString().length === 4;

const CheckInPage: SFC<CheckInPageProps> = ({error}) => {
    const [locationCode, setLocationCode] = useState<string>("");
    const {
        requestLocation,
        loading,
        location,
    } = useLocation();
    const router = useRouter();

    const { t } = useTranslation("enterCode");

    const handleLocationCodeChange = useCallback((code: string) => {
        if (location !== undefined) return;
        setLocationCode(code);
        const validCode = isValidLocationCode(code);
        if (validCode) {
            requestLocation(code);
        }
    }, []);

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

            <Notice>{t("Mit Raumcode einchecken")}</Notice>

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

export default CheckInPage;

export const getServerSideProps: GetServerSideProps = withLocaleProp(
    async (context) => {
        // api call
        const cookie = context.req.headers.cookie!;
        const empty = { props: {} };

        const { data: profile, error, status } = await getProfileRequest({
            cookie,
        });
        console.log(profile, error, status);

        if (status === httpStatuses.notAuthorized) {
            redirectServerSide(context.res, appUrls.createProfile);
            return empty;
        }

        if (!!error) {
            return {
                props: {
                    error,
                    status
                }
            }
        }

        return {
            props: {
                profile,
            },
        };
    }
);
