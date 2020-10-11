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
import { Button } from "../components/common/Button";

interface CheckInPageProps {
    profile: Profile;
}

const isValidLocationCode = (locationCode: string) =>
    parseInt(locationCode).toString().length === 4;

const CheckInPage: SFC<CheckInPageProps> = (props) => {
    const { profile } = props;
    const [locationCode, setLocationCode] = useState<string>("");
    const {
        requestLocation,
        loading,
        location,
        success,
        error,
    } = useLocation();
    const router = useRouter();

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
            router.push("checkin/[locationCode]", `checkin/${location.code}`);
        } else {
            setLocationCode("");
        }
    }, [loading, location]);

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

            <span className="desc">Checkin per Raumcode</span>

            <div className="location-code-container">
                <LocationCodeInput
                    onChange={handleLocationCodeChange}
                    code={locationCode}
                ></LocationCodeInput>
            </div>
            <Button onClick={() => {}}>CHECK IN</Button>
        </>
    );
};

export default CheckInPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
    // api call
    const cookie = context.req.headers.cookie!;
    const empty = {props:{}}

    const { data: profile, error, status } = await getProfileRequest({
        cookie,
    });

    // redirect when not logged in
    if (status === 403) {
        redirectServerSide(context.res, "/new");
        return empty;
    }

    return {
        props: {
            profile,
        },
    };
};
