import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Key, X } from "react-feather";
import SmoothCollapse from "react-smooth-collapse";
import { requestSubpages } from "../../../config";
import { useTranslation } from "../../../localization";
import useDelayedCallback from "../../../src/hooks/useDelayedCallback";
import useReservationState from "../../../src/hooks/useReservation";
import useResource from "../../../src/hooks/useResource";
import useResources from "../../../src/hooks/useResources";
import useValidation from "../../../src/hooks/useValidation";
import Resource from "../../../src/model/api/Resource";
import { empty, notEmpty } from "../../../src/util/TypeUtil";
import useSubPage from "../../api/useSubPage";
import Fade from "../../common/Fade";
import FormElement from "../../common/FormElement";
import FormElementBase from "../../common/FormElementBase";
import FormInput from "../../common/FormInput";
import List from "../../common/List";
import Loading, { LoadingInline } from "../../common/Loading";
import NewButton from "../../common/NewButton";
import Notice from "../../common/Notice";
import ResourceListItem from "../../common/ResourceListItem";

interface SetRoomSubpageProps {}

const SetRoomSubpage: React.FunctionComponent<SetRoomSubpageProps> = ({}) => {
    const [searchValue, setSearchValue] = useState("");
    const { t } = useTranslation();
    const queryResourceRequest = useResources(false);
    const { goForward } = useSubPage(requestSubpages);
    const [selectedResource, setSelectedResource] = useReservationState(
        "resource"
    );
    const { hasError } = useValidation();

    const load = useCallback((searchValue: string) => {
        return queryResourceRequest.requestResources(
            searchValue,
            undefined,
            10
        );
    }, []);

    const update = useDelayedCallback(() => load(searchValue), 300);
    useEffect(() => {
        if (searchValue.length >= 3) {
            update();
        } else {
            queryResourceRequest.reset();
        }
    }, [searchValue]);

    const handleResourceSelect = useCallback((resource: Resource) => {
        const handle = (selected?: boolean) => {
            if (selected) {
                setSelectedResource(resource);
            } else {
                setSelectedResource(undefined);
            }
        };

        return handle;
    }, []);

    const hasResults =
        queryResourceRequest.result && queryResourceRequest.result.length > 0;
    const noResults = queryResourceRequest.state === "success" && !hasResults;
    const showDropdown = hasResults || noResults;
    return (
        <>
            <style jsx>{``}</style>
            {selectedResource ? (
                <FormElement
                    bottomSpacing={2}
                    value={[
                        selectedResource.name,
                        selectedResource.display_numbers || "",
                    ]}
                    icon={<X />}
                    onIconClick={() => setSelectedResource(undefined)}
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
                                                        r
                                                    )}
                                                />
                                            )
                                        )}
                                    </>
                                )}
                                {!hasResults && "loading" && (
                                    <FormElementBase noOutline noBottomSpacing>
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
                bottomSpacing={4}
            >
                {t("Raumübersicht öffnen")}
            </NewButton>

            <Fade in={hasError("missingResourcePermissions")}>
                <Notice
                    error
                    title={t("Der Raum {roomNumber} ist zugangsbeschränkt.", {
                        roomNumber: selectedResource?.display_name || "",
                    })}
                >
                    {t(
                        "Wenn du trotzdem auf „Absenden“ klickst, geht deine Anfrage zur Bearbeitung an „[Person / RT / CO]“. Hinterlasse ihr/ihm am besten eine Notiz und erkläre, warum du in den Raum nutzen möchtest."
                    )}
                </Notice>
            </Fade>

            <Notice>
                Gib die Raumnummer oder Raumbezeichnung des Raumes an, den du
                anfragen möchtest. Die Raumübersicht kann dir bei der Auswahl
                helfen. Hier findest du die Raumnummer und -bezeichnung, sowie
                die Raumgröße und die max. zulässige Personenzahl während der
                Covid-19 Maßnahmen. Wenn du mehrere Räume zur gleichen Zeit
                anfragen möchtest, kommst du nach Absenden deiner Anfrage mit
                einem Klick wieder hierhin.
            </Notice>
        </>
    );
};

export default SetRoomSubpage;
