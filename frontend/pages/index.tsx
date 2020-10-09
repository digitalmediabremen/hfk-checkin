import Head from "next/head";
import { GetServerSideProps } from "next";
import { profile } from "console";
import { getProfileRequest } from "../components/api/ApiService";
import { useState, SFC, useCallback } from "react";
import Profile from "../model/Profile";
import LocationCodeInput from "../components/common/LocationCodeInput";
import { useCheckin, useLocation } from "../components/api/ApiHooks";

interface CheckInPageProps {
    profile: Profile;
}

const isValidLocationCode = (locationCode:string) => parseInt(locationCode).toString().length === 4;

const CheckInPage: SFC<CheckInPageProps> = (props) => {
    const { profile } = props;
    const [locationCode, setLocationCode] = useState<string>("");
    const {doCheckin} = useCheckin();
    const {getLocation, loading} = useLocation();

    const handleLocationCodeChange = useCallback((code: string) => {
        setLocationCode(code);
        const validCode = isValidLocationCode(code);
        if (validCode) getLocation(code);
    }, []);

    return (
        <>
            {profile.first_name} {profile.last_name}{" "}
            {profile.phone || "Phone not set"}{" "}
            {loading && "loading"}
            <LocationCodeInput onChange={handleLocationCodeChange} code={locationCode}></LocationCodeInput>
        </>
    );
};

export default CheckInPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
    // api call
    const cookie = context.req.headers.cookie;
    const { data: profile, error, status } = await getProfileRequest({
        cookie,
    });

    // redirect when not logged in
    // if (status === 403) {
    //     const { res } = context;
    //     res.writeHead(302, {
    //         Location: "new",
    //     });
    //     res.end();
    //     return { props: {} };
    // }

    return {
        props: {
            profile: {
                first_name: "L",
                last_name: "P"
            },
        },
    };
};
