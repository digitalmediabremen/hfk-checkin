import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, X } from "react-feather";
import SmoothCollapse from "react-smooth-collapse";
import { requestSubpages } from "../../../config";
import { useTranslation } from "../../../localization";
import useReservationState from "../../../src/hooks/useReservation";
import useResource from "../../../src/hooks/useResource";
import useResources from "../../../src/hooks/useResources";
import Resource from "../../../src/model/api/Resource";
import { empty, notEmpty } from "../../../src/util/TypeUtil";
import useSubPage from "../../api/useSubPage";
import FormElement from "../../common/FormElement";
import FormElementBase from "../../common/FormElementBase";
import FormInput from "../../common/FormInput";
import List from "../../common/List";
import Loading, { LoadingInline } from "../../common/Loading";
import NewButton from "../../common/NewButton";
import ResourceListItem from "../../common/ResourceListItem";

interface SetRoomSubpageProps {}

const SetRoomSubpage: React.FunctionComponent<SetRoomSubpageProps> = ({}) => {
    const [searchValue, setSearchValue] = useState("");
    const { t } = useTranslation();
    const queryResourceRequest = useResources(false);
    const { goForward } = useSubPage(requestSubpages);
    const [selectedResourceId, setSelectedResourceId] = useReservationState(
        "resource_uuid"
    );
    const selectedResourceRequest = useResource();
    const [selectedResource, setSelectedResource] = useState<Resource>();
    const [loading, setLoading] = useState(!!selectedResourceId);

    useEffect(() => {
        if (!selectedResourceId) {
            setSelectedResource(undefined);
            return;
        }
        const withinSearch = queryResourceRequest.result?.find(
            (r) => r.uuid === selectedResourceId
        );
        if (notEmpty(withinSearch)) {
            setSelectedResource(withinSearch);
            setLoading(false);
        } else {
            if (notEmpty(selectedResourceRequest.result)) {
                setSelectedResource(selectedResourceRequest.result);
                setLoading(false);
            } else {
                selectedResourceRequest.request(selectedResourceId);
            }
        }
    }, [selectedResourceId, selectedResourceRequest.result]);

    const load = useCallback((searchValue: string) => {
        return queryResourceRequest.requestResources(
            searchValue,
            undefined,
            10
        );
    }, []);

    const timerId = useRef<number>();
    useEffect(() => {
        if (searchValue.length >= 3) {
            timerId.current = window.setTimeout(() => load(searchValue), 300);
        } else {
            queryResourceRequest.reset();
        }
        return () => {
            if (timerId.current) window.clearTimeout(timerId.current);
        };
    }, [searchValue]);

    const handleResourceSelect = useCallback((resourceId: string) => {
        const handle = (selected?: boolean) => {
            if (selected) {
                setSelectedResourceId(resourceId);
            } else {
                setSelectedResourceId(undefined);
            }
        };

        return handle;
    }, []);

    const hasResults =
        queryResourceRequest.result && queryResourceRequest.result.length > 0;
    const noResults = queryResourceRequest.state === "success" && !hasResults;
    const showDropdown = hasResults || noResults;
    return (
        <Loading loading={loading}>
            <style jsx>{``}</style>
            {selectedResource ? (
                <FormElement
                    bottomSpacing={2}
                    value={[
                        selectedResource.name,
                        selectedResource.display_numbers || "",
                    ]}
                    icon={<X />}
                    onIconClick={() => setSelectedResourceId(undefined)}
                />
            ) : (
                <>
                    <FormElementBase
                        bottomSpacing={showDropdown ? -1 : 2}
                        zIndex={2}
                    >
                        <FormInput
                            value={searchValue}
                            placeholder="Raum einfügen"
                            onChange={(e) => setSearchValue(e.target.value)}
                        />

                        <LoadingInline
                            loading={!showDropdown && searchValue.length >= 3}
                        />
                    </FormElementBase>
                    {showDropdown && (
                        <FormElementBase
                            extendedWidth
                            noPadding
                            maxHeight="35vh"
                            bottomSpacing={2}
                        >
                            <List>
                                {hasResults && (
                                    <>
                                        {queryResourceRequest.result?.map(
                                            (r, index) => (
                                                <ResourceListItem
                                                    key={index}
                                                    resource={r}
                                                    last={
                                                        index ===
                                                        queryResourceRequest.result!
                                                            .length -
                                                            1
                                                    }
                                                    onSelect={handleResourceSelect(
                                                        r.uuid
                                                    )}
                                                />
                                            )
                                        )}
                                    </>
                                )}
                                {!hasResults && "loading" && (
                                    <FormElementBase
                                        noOutline
                                        noBottomSpacing
                                    >
                                        {t("Keine Ergebnisse")}
                                    </FormElementBase>
                                )}
                            </List>
                        </FormElementBase>
                    )}
                </>
            )}
            <NewButton
                noOutline
                iconRight={<ArrowRight strokeWidth={1} />}
                onClick={() => goForward("resource-list")}
            >
                {t("Raumübersicht öffnen")}
            </NewButton>
        </Loading>
    );
};

export default SetRoomSubpage;
