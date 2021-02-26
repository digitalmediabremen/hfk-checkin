import React, { useEffect, useState } from "react";
import { ArrowRight } from "react-feather";
import { requestSubpages } from "../../../config";
import { useTranslation } from "../../../localization";
import useReservationState from "../../../src/hooks/useReservation";
import useResources from "../../../src/hooks/useResources";
import Resource from "../../../src/model/api/Resource";
import { empty } from "../../../src/util/TypeUtil";
import useSubPage from "../../api/useSubPage";
import FormElementBase from "../../common/FormElementBase";
import FormInput from "../../common/FormInput";
import Loading from "../../common/Loading";
import NewButton from "../../common/NewButton";

interface SetRoomSubpageProps {}

const SetRoomSubpage: React.FunctionComponent<SetRoomSubpageProps> = ({}) => {
    const [searchValue, setSearchValue] = useState("");
    const { t } = useTranslation();
    const { result, state, requestResources } = useResources(false);
    const { goForward } = useSubPage(requestSubpages);
    const [selectedResourceId, setSelectedResourceId] = useReservationState(
        "resource_uuid"
    );
    const [selectedResource, setSelectedResource] = useState<Resource>();

    useEffect(() => {
        if (searchValue.length >= 3) {
            requestResources(searchValue);
        }
    }, [searchValue]);

    useEffect(() => {
        if (empty(result)) return;
        const selected = result.find((r) => r.uuid === selectedResourceId);
        setSelectedResource(selected);
        console.log(result);
    }, [result, selectedResourceId]);

    return (
        <>
            <style jsx>{``}</style>
            <FormElementBase extendedWidth bottomSpacing={1}>
                <FormInput
                    value={searchValue}
                    placeholder="Raum einfügen"
                    onChange={(e) => setSearchValue(e.target.value)}
                />
            </FormElementBase>
            <NewButton
                noOutline
                extendedWidth
                iconRight={<ArrowRight strokeWidth={1} />}
                onClick={() => goForward("resource-list")}
            >
                {t("Raumübersicht öffnen")}
            </NewButton>
        </>
    );
};

export default SetRoomSubpage;
