import React, { useEffect } from "react";
import { useRouter } from "next/router";
import needsProfile from "../../components/api/needsProfile";
import Profile from "../../model/Profile";
import useParam from "../../components/hooks/useParam";
import {
    useCheckin,
    useActiveCheckins,
    ResultModifierFunction,
} from "../../components/api/ApiHooks";
import { CheckinComponent } from "../checkin/[locationCode]";
import Title from "../../components/common/Title";
import Loading from "../../components/common/Loading";
import { LastCheckin } from "../../model/Checkin";

interface CheckoutPageProps {
    profile: Profile;
}

const CheckoutPage: React.FunctionComponent<CheckoutPageProps> = ({
    profile,
}) => {
    const [checkinId, router] = useParam("checkinId");
    const { data } = useCheckin(checkinId);

    const excludeCheckinModifier = React.useCallback<
        ResultModifierFunction<LastCheckin[]>
    >(
        (checkins?: LastCheckin[]) => {
            return data.state === "success"
                ? checkins?.filter((c) => c.id !== data.result.id)
                : undefined;
        },
        [data.result]
    );

    const { data: activeCheckinData } = useActiveCheckins(
        excludeCheckinModifier
    );

    if (!checkinId) return null;
    if (data.state === "error") return <>{data.error}</>;

    return (
        <Loading loading={data.state === "loading"}>
            {data.result && activeCheckinData.result && (
                <CheckinComponent
                    activeCheckins={activeCheckinData.result!}
                    checkin={data.result!}
                    alreadyCheckedIn={true}
                    activeCheckinsUpdating={
                        activeCheckinData.state === "loading"
                    }
                />
            )}
            {!!activeCheckinData.error && (
                <Title>{activeCheckinData.error}</Title>
            )}
        </Loading>
    );
};

export default needsProfile(CheckoutPage);
