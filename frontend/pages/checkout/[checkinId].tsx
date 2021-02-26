import React from "react";
import {
    ResultModifierFunction,
    useActiveCheckins,
    useCheckin,
} from "../../components/api/ApiHooks";
import needsProfile from "../../components/api/needsProfile";
import showIf from "../../components/api/showIf";
import Loading from "../../components/common/Loading";
import Title from "../../components/common/Title";
import useParam from "../../src/hooks/useParam";
import features from "../../features";
import { LastCheckin } from "../../src/model/api/Checkin";
import Profile from "../../src/model/api/Profile";
import { CheckinComponent } from "../checkin/[locationCode]";

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

export default showIf(() => features.checkin, needsProfile(CheckoutPage));
