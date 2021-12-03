import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { de as deLocale, enUS as enLocale } from "date-fns/locale";
import React from "react";
import { CreditCard } from "react-feather";
import { useTranslation } from "../../localization";
import useKeycardInfo from "../../src/hooks/useKeycardInfo";
import FormElement, { FormElementProps } from "./FormElement";
import FormText from "./FormText";
import Loading, { LoadingInline } from "./Loading";

interface KeycardFormElementProps
    extends Omit<FormElementProps, "value" | "labelIcon"> {}

const KeycardFormElement: React.FunctionComponent<KeycardFormElementProps> = ({
    ...formElementProps
}) => {
    const { t, locale } = useTranslation("setprofile");
    const keycardApi = useKeycardInfo();

    const syncedText = (() => {
        if (keycardApi.state !== "success") return;
        const { result } = keycardApi;
        if (result.total_permission_count === 0) {
            return t("Noch keine Zugangsberechtigungen");
        } else if (
            result.synced_permission_count === result.total_permission_count
        ) {
            return t("Alle {total} Berechtigungen sind aktiv", {
                total: result.total_permission_count,
            });
        } else if (
            result.synced_permission_count < result.total_permission_count
        ) {
            return t(
                "{synced}/{total} deiner Berichtigungen sind synchronisiert",
                {
                    synced: result.synced_permission_count,
                    total: result.total_permission_count,
                }
            );
        }
    })();

    const lastSyncedText = (() => {
        if (keycardApi.state !== "success") return;
        const { result } = keycardApi;
        if (!result.permissions_last_synced_at) return;

        return t("Zuletzt aktualisiert {distance}", {
            distance: formatDistanceToNow(result.permissions_last_synced_at, {
                addSuffix: true,
                locale: locale === "de" ? deLocale : enLocale,
            }),
        });
    })();

    return (
        <>
            {keycardApi.state === "loading" && (
                <FormElement
                    {...formElementProps}
                    labelIcon={<CreditCard />}
                    value={[<LoadingInline loading />]}
                    bottomSpacing={2}
                />
            )}
            {keycardApi.state === "success" && (
                <>
                    <style jsx>{``}</style>
                    <FormElement
                        {...formElementProps}
                        labelIcon={<CreditCard />}
                        value={[keycardApi.result.number, syncedText]}
                        bottomSpacing={2}
                    />
                    {lastSyncedText && (
                        <FormText
                            bottomSpacing={formElementProps.bottomSpacing}
                        >
                            {lastSyncedText}
                        </FormText>
                    )}
                </>
            )}
        </>
    );
};

export default KeycardFormElement;
