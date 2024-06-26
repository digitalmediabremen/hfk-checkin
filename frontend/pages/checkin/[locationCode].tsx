import { useRouter } from "next/router";
import * as React from "react";
import { ArrowLeft } from "react-feather";
import {
    ResultModifierFunction,
    useActiveCheckins,
    useDoCheckin,
    useDoCheckout
} from "../../components/api/ApiHooks";
import needsProfile from "../../components/api/needsProfile";
import showIf from "../../components/api/showIf";
import AlignContent from "../../components/common/AlignContent";
import { useAppState } from "../../components/common/AppStateProvider";
import { ButtonWithLoading } from "../../components/common/Button";
import AnimatedIcon from "../../components/common/CheckinSuccessIcon";
import FormElementWrapper from "../../components/common/FormElementWrapper";
import LastCheckins from "../../components/common/LastCheckinsList";
import Layout from "../../components/common/Layout";
import Loading, { LoadingInline } from "../../components/common/Loading";
import NewButton from "../../components/common/NewButton";
import Subtitle from "../../components/common/Subtitle";
import Title from "../../components/common/Title";
import { appUrls } from "../../config";
import features from "../../features";
import { useTranslation } from "../../localization";
import useParam from "../../src/hooks/useParam";
import { LastCheckin } from "../../src/model/api/Checkin";
import MyProfile from "../../src/model/api/MyProfile";
import Error from "../Error";

export const CheckinComponent: React.FunctionComponent<{
    checkin: LastCheckin;
    alreadyCheckedIn: boolean;
    activeCheckins: LastCheckin[];
    activeCheckinsUpdating?: boolean;
}> = ({
    checkin,
    activeCheckins,
    alreadyCheckedIn,
    activeCheckinsUpdating,
}) => {
    const { location } = checkin;
    const { org_name, org_number, capacity, load, code } = location;
    const {
        doCheckout,
        success,
        loading: checkoutInProgress,
    } = useDoCheckout();

    const { dispatch } = useAppState();
    const router = useRouter();

    const { t } = useTranslation("checkin");
    const isRootLocation = load === -1;

    React.useEffect(() => {
        if (!alreadyCheckedIn) window?.navigator?.vibrate?.(200);
    }, []);

    React.useEffect(() => {
        if (!success) return;

        dispatch({
            type: "checkout",
            message: t("Erfolgreich ausgecheckt"),
            highlightCheckinById: checkin.id,
        });

        dispatch({
            type: "disableNextUpdate",
        });
        router.push(appUrls.profile);
        // return () => clearTimeout(timerId);
    }, [success]);

    const handleActiveCheckinClick = (index: number) => {
        if (activeCheckinsUpdating) return;
        const checkin = activeCheckins[index];
        if (!checkin) return;
        if (!checkin.is_active) return;
        const { id: checkinId } = checkin;
        router.push(...appUrls.checkout(checkinId));
    };

    return (
        <Layout>
            {!alreadyCheckedIn && <AnimatedIcon />}
            {/* {alreadyCheckedIn && (
                <Notice>{t("Du bist bereits eingecheckt")}.</Notice>
            )} */}
            <Title bold subtext={org_number}>
                {org_name}
            </Title>
            {!isRootLocation && (
                <Title subtext={t("Personen aktuell eingecheckt")}>
                    {load}
                    {!!capacity && ` / ${capacity}`}
                </Title>
            )}
            <br />
            <NewButton
                onClick={() => doCheckout(code)}
                primary
                iconLeft={<ArrowLeft strokeWidth={1} />}
                iconRight={<LoadingInline invertColor loading={checkoutInProgress} />}
                disabled={checkoutInProgress}
            >
                {t("Auschecken")}
            </NewButton>
            {activeCheckins.length > 0 && (
                <AlignContent offsetBottomPadding>
                    <FormElementWrapper noBottomMargin>
                        <Subtitle>
                            {t("Du bist noch an folgenden Orten eingecheckt:")}
                            <LoadingInline
                                loading={
                                    activeCheckinsUpdating !== undefined &&
                                    activeCheckinsUpdating
                                }
                            />
                        </Subtitle>
                        <LastCheckins
                            onCheckinClick={handleActiveCheckinClick}
                            checkins={activeCheckins}
                            interactive
                        />
                    </FormElementWrapper>
                </AlignContent>
            )}
        </Layout>
    );
};

interface CheckinProps {
    profile: MyProfile;
}

const CheckinPage: React.FunctionComponent<CheckinProps> = ({ profile }) => {
    const { t } = useTranslation("checkin");
    const [locationCode, router] = useParam("locationCode");
    const { data, alreadyCheckedIn, notVerified } = useDoCheckin(locationCode);
    const { dispatch } = useAppState();

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

    // prefetch url which is later redirected to
    React.useEffect(() => {
        if (data.state === "error" && notVerified)
            router.replace(appUrls.verifyProfile);
        if (data.state !== "success") return;
        let timerId: number | undefined = undefined;
        const url = appUrls.checkout(data.result.id);
        router.prefetch(...url);
        if (alreadyCheckedIn) {
            dispatch({
                type: "status",
                status: {
                    message: t("Du bist bereits eingecheckt"),
                    isError: false,
                },
            }),
                router.replace(...url);
        } else {
            timerId = window.setTimeout(
                () =>
                    dispatch({
                        type: "status",
                        status: {
                            message: t("Checkin erfolgreich"),
                            isError: false,
                        },
                    }),
                500
            );
        }
        return () => clearTimeout(timerId);
    }, [data.state]);

    if (alreadyCheckedIn || notVerified) return null;

    return (
        <Loading loading={data.state === "loading"}>
            {data.result && activeCheckinData.result && (
                <CheckinComponent
                    checkin={data.result!}
                    alreadyCheckedIn={alreadyCheckedIn}
                    activeCheckins={activeCheckinData.result!}
                    activeCheckinsUpdating={
                        activeCheckinData.state === "loading"
                    }
                />
            )}
            {!!activeCheckinData.error || !!data.error && (
                <Error />
            )}
        </Loading>
    );
};

export default showIf(() => features.checkin, needsProfile(CheckinPage));
