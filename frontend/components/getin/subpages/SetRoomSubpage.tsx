import React, { useCallback, useEffect, useState } from "react";
import { ArrowRight, X } from "react-feather";
import { requestSubpages } from "../../../config";
import { useTranslation } from "../../../localization";
import useDelayedCallback from "../../../src/hooks/useDelayedCallback";
import useReservationState from "../../../src/hooks/useReservationState";
import useResources from "../../../src/hooks/useResources";
import useUnits from "../../../src/hooks/useUnits";
import useValidation from "../../../src/hooks/useValidation";
import Resource from "../../../src/model/api/Resource";
import useSubPage from "../../api/useSubPage";
import Fade from "../../common/Fade";
import FormCheckbox from "../../common/FormCheckbox";
import FormElement from "../../common/FormElement";
import FormElementBase from "../../common/FormElementBase";
import FormInput from "../../common/FormInput";
import List from "../../common/List";
import { LoadingInline } from "../../common/Loading";
import NewButton from "../../common/NewButton";
import Notice from "../../common/Notice";
import ResourceListItem from "../../common/ResourceListItem";
import SectionTitle from "../../common/SectionTitle";

interface SetRoomSubpageProps {}

const SetRoomSubpage: React.FunctionComponent<SetRoomSubpageProps> = ({}) => {
    const [searchValue, setSearchValue] = useState("");
    const { t } = useTranslation("request-resource");
    const queryResourceRequest = useResources(false);
    const unitsApi = useUnits();
    const { goForward } = useSubPage(requestSubpages);
    const [selectedResource, setSelectedResource] = useReservationState(
        "resource"
    );
    const [units, setUnits] = useReservationState("units");
    const [selectedUnitId, setSelectedUnitId] = useReservationState(
        "selectedUnitId"
    );
    const [checked, setChecked] = useReservationState(
        "exclusive_resource_usage"
    );

    useEffect(() => {
        if (unitsApi.state !== "success") return;
        setUnits(unitsApi.result);
    }, [unitsApi.state]);

    useEffect(() => {
        reset();
    }, [selectedUnitId]);

    const { hasError } = useValidation();

    const reset = () => {
        setSelectedResource(undefined);
        queryResourceRequest.reset();
        setSearchValue("");
    };

    const handleDeselectResource = () => {
        reset();
    };

    const load = useCallback((searchValue: string) => {
        if (!selectedUnitId) return;

        return queryResourceRequest.requestResources(
            selectedUnitId,
            searchValue,
            undefined,
            20
        );
    }, []);

    const update = useDelayedCallback(() => load(searchValue), 300);
    useEffect(() => {
        if (searchValue.length >= 2) {
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
    }, [setSelectedResource]);

    const hasResults =
        queryResourceRequest.result && queryResourceRequest.result.length > 0;
    const noResults = queryResourceRequest.state === "success" && !hasResults;
    const showDropdown = hasResults || noResults;
    return (
        <>
            <SectionTitle>Gebäude auswählen</SectionTitle>
            {units?.map((unit, index) => (
                <FormElement
                    primary={unit.uuid === selectedUnitId}
                    onClick={() => setSelectedUnitId(unit.uuid)}
                    superNarrow
                    value={unit.name}
                    adaptiveWidth
                    key={unit.uuid}
                    bottomSpacing={index === units.length - 1 ? 4 : 1}
                />
            ))}

            {selectedUnitId && (
                <>
                    {selectedResource ? (
                        <FormElement
                            bottomSpacing={2}
                            value={[
                                selectedResource.display_numbers || "",
                                <b>{selectedResource.name}</b>,
                            ]}
                            actionIcon={<X />}
                            onIconClick={handleDeselectResource}
                        />
                    ) : (
                        <>
                            <FormElementBase
                                bottomSpacing={showDropdown ? -1 : 2}
                                zIndex={2}
                            >
                                <FormInput
                                    autoFocus
                                    value={searchValue}
                                    placeholder={t("Raum auswählen")}
                                    onChange={(e) =>
                                        setSearchValue(e.target.value)
                                    }
                                />

                                <LoadingInline
                                    loading={
                                        !showDropdown && searchValue.length >= 2
                                    }
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
                        onClick={() =>
                            goForward("resource-list", selectedUnitId)
                        }
                        bottomSpacing={4}
                    >
                        {t("Raumübersicht öffnen")}
                    </NewButton>

                    <Fade in={hasError("missingResourcePermissions")}>
                        <Notice
                            error
                            title={t(
                                "Der Raum {roomNumber} ist zugangsbeschränkt.",
                                {
                                    roomNumber:
                                        selectedResource?.display_name || "",
                                }
                            )}
                            bottomSpacing={4}
                        >
                            {t(
                                "Wenn du trotzdem auf „Absenden“ klickst, geht deine Anfrage zur Bearbeitung an „[Person / RT / CO]“. Hinterlasse ihr/ihm am besten eine Notiz und erkläre, warum du in den Raum nutzen möchtest."
                            )}
                        </Notice>
                    </Fade>

                    <FormCheckbox
                        value={checked || false}
                        label={t("Ich beanspruche den ganzen Raum")}
                        onChange={setChecked}
                        bottomSpacing={2}
                    />

                    {!hasError("missingResourcePermissions") && (
                        <Notice>
                            Gib die Raumnummer oder Raumbezeichnung des Raumes
                            an, den du anfragen möchtest. Die Raumübersicht kann
                            dir bei der Auswahl helfen. Hier findest du die
                            Raumnummer und -bezeichnung, sowie die Raumgröße und
                            die max. zulässige Personenzahl während der Covid-19
                            Maßnahmen. Wenn du mehrere Räume zur gleichen Zeit
                            anfragen möchtest, kommst du nach Absenden deiner
                            Anfrage mit einem Klick wieder hierhin.
                        </Notice>
                    )}
                </>
            )}
        </>
    );
};

export default SetRoomSubpage;
