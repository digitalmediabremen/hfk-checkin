import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Info, Menu, Search, X } from "react-feather";
import { requestSubpages } from "../../../config";
import { useTranslation } from "../../../localization";
import useDelayedCallback from "../../../src/hooks/useDelayedCallback";
import useReservationState from "../../../src/hooks/useReservationState";
import useResources from "../../../src/hooks/useResources";
import useTheme from "../../../src/hooks/useTheme";
import useUnits from "../../../src/hooks/useUnits";
import useValidation from "../../../src/hooks/useValidation";
import { ValidationObject } from "../../../src/model/api/NewReservationValidationFixLater";
import Resource from "../../../src/model/api/Resource";
import { scrollIntoView } from "../../../src/util/DomUtil";
import { useResourceFormValuePresenter } from "../../../src/util/ReservationPresenterUtil";
import useSubPage from "../../api/useSubPage";
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
import ValidationResult from "../../common/ValidationResult";

interface SetRoomSubpageProps {}

export function resourcePageValidationFilter(
    validationObject: ValidationObject
) {
    if (validationObject.context?.includes("access")) return true;
    return false;
}

export function ResourceValidationIconSummary() {
    const { getHighestValidationIcon } = useValidation();
    const Icon = getHighestValidationIcon(resourcePageValidationFilter);
    return !!Icon ? <Icon /> : null;
}

const SetRoomSubpage: React.FunctionComponent<SetRoomSubpageProps> = ({}) => {
    const [searchValue, setSearchValue] = useState("");
    const { t, locale } = useTranslation("request-resource");
    const queryResourceRequest = useResources(false);
    const unitsApi = useUnits();
    const { goForward } = useSubPage(requestSubpages);
    const [selectedResource, setSelectedResource] =
        useReservationState("resource");
    const [units, setUnits] = useReservationState("units");
    const [selectedUnitId, setSelectedUnitId] =
        useReservationState("selectedUnitId");
    const [checked, setChecked] = useReservationState(
        "exclusive_resource_usage"
    );

    const noResults =
        queryResourceRequest.result && queryResourceRequest.result.length === 0;
    const loading = queryResourceRequest.state === "loading";
    const showDropdown =
        !!queryResourceRequest.result && searchValue.length >= 2;
    const inputRef = useRef<HTMLInputElement>(null);
    const { has, getError } = useValidation();
    const theme = useTheme();
    const resourceFormValuePresenter = useResourceFormValuePresenter();

    useEffect(() => {
        unitsApi.requestUnits();
        const timer = window.setTimeout(() => inputRef.current?.focus(), 300);
        return () => window.clearTimeout(timer);
    }, []);

    // scroll input into view
    useEffect(() => {
        if (!showDropdown) return;
        if (!inputRef.current) return;
        scrollIntoView(
            inputRef.current,
            theme.topBarHeight() + theme.spacing(4) + theme.offsetTopBar
        );
    }, [showDropdown]);

    useEffect(() => {
        if (units) {
            // if only one unit autoselect it
            if (units.length === 1) {
                const unit = units[0];
                setSelectedUnitId(unit.slug);
            }
        }
    }, [units]);

    useEffect(() => {
        if (unitsApi.state !== "success") return;
        setUnits(unitsApi.result);
    }, [unitsApi.state]);

    const resetInputField = () => {
        setSelectedResource(undefined);
        queryResourceRequest.reset();
        setSearchValue("");
        const timer = window.setTimeout(() => inputRef.current?.focus(), 10);
        return () => window.clearTimeout(timer);
    };

    const handleDeselectResource = () => {
        resetInputField();
    };

    const handleSetUnit = (unitId: string) => {
        setSelectedUnitId(unitId);
        resetInputField();
    };

    const load = useCallback(
        (newSearchValue: string) => {
            if (!selectedUnitId) return;

            return queryResourceRequest.requestResources(
                selectedUnitId,
                newSearchValue,
                undefined,
                20
            );
        },
        [selectedUnitId]
    );

    const update = useDelayedCallback(() => load(searchValue), 300);
    useEffect(() => {
        if (searchValue.length >= 2) {
            update();
        } else {
            queryResourceRequest.reset();
        }
    }, [searchValue]);

    const handleResourceSelect = useCallback(
        (resource: Resource) => {
            const handle = () => {
                const selected = resource.uuid === selectedResource?.uuid;
                if (!selected) {
                    setSelectedResource(resource);
                } else {
                    setSelectedResource(undefined);
                }
            };

            return handle;
        },
        [setSelectedResource]
    );

    return (
        <>
            {units && units.length > 1 && (
                <>
                    <SectionTitle>{t("Gebäude auswählen")}</SectionTitle>
                    {units?.map((unit, index) => (
                        <FormElement
                            primary={unit.slug === selectedUnitId}
                            onClick={() => handleSetUnit(unit.slug)}
                            density="super-narrow"
                            value={unit.name}
                            width="adaptive"
                            key={unit.uuid}
                            bottomSpacing={index === units.length - 1 ? 4 : 1}
                        />
                    ))}
                </>
            )}

            {selectedUnitId && (
                <>
                    <SectionTitle bottomSpacing={2}>
                        {t("Raum suchen")}
                    </SectionTitle>
                    {selectedResource ? (
                        <FormElement
                            bottomSpacing={2}
                            value={resourceFormValuePresenter(
                                selectedResource,
                                true,
                                true
                            )}
                            actionIcon={<X />}
                            onIconClick={handleDeselectResource}
                        />
                    ) : (
                        <>
                            <FormElementBase
                                bottomSpacing={showDropdown ? -1 : 1}
                                zIndex={2}
                                above={showDropdown}
                            >
                                <Search
                                    style={{
                                        marginRight: `${theme.spacing(1)}px`,
                                    }}
                                />
                                <FormInput
                                    // autoFocus
                                    ref={inputRef}
                                    value={searchValue}
                                    placeholder={t(
                                        "Suche nach Name, Nummer oder Austattungsmerkmalen ..."
                                    )}
                                    onChange={(e) =>
                                        setSearchValue(e.target.value)
                                    }
                                />

                                <LoadingInline loading={loading} />
                            </FormElementBase>
                            {showDropdown && (
                                <FormElementBase
                                    extendedWidth
                                    noPadding
                                    maxHeight="35vh"
                                    bottomSpacing={2}
                                >
                                    <List>
                                        {!noResults && (
                                            <>
                                                {queryResourceRequest.result?.map(
                                                    (r, index) => (
                                                        <ResourceListItem
                                                            key={index}
                                                            resource={r}
                                                            includeAlternativeNames
                                                            last={
                                                                index ===
                                                                queryResourceRequest.result!
                                                                    .length -
                                                                    1
                                                            }
                                                            onClick={handleResourceSelect(
                                                                r
                                                            )}
                                                        />
                                                    )
                                                )}
                                            </>
                                        )}
                                        {noResults && (
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
                            <NewButton
                                // noOutline
                                iconLeft={<Menu strokeWidth={1} />}
                                iconRight={<ArrowRight strokeWidth={1} />}
                                onClick={() =>
                                    goForward("resource-list", selectedUnitId)
                                }
                                bottomSpacing={4}
                            >
                                {t("Aus Liste wählen")}
                            </NewButton>
                        </>
                    )}

                    {selectedResource?.description && (
                        <FormElement
                            // label="Info"
                            labelIcon={<Info />}
                            alignLabelIconTop
                            density="super-narrow"
                            noOutline
                            noPadding
                            value={<>{selectedResource?.description}</>}
                            maxRows={6}
                            bottomSpacing={4}
                        />
                    )}

                    {selectedResource && (
                        <ValidationResult filter={resourcePageValidationFilter}>
                            {(validationObject) =>
                                validationObject.type ===
                                    "ReservationPermissionCriticalWarning" && (
                                    <>
                                        {t(
                                            "Wenn du dies für einen Fehler hälst, solltest du im Kommentar der Buchung deine Situation schildern."
                                        )}
                                        <br />
                                        <NewButton
                                            noOutline
                                            iconRight={
                                                <ArrowRight strokeWidth={1} />
                                            }
                                            onClick={() => goForward("message")}
                                        >
                                            {t("Kommentar hinzufügen")}
                                        </NewButton>
                                    </>
                                )
                            }
                        </ValidationResult>
                    )}

                    <FormCheckbox
                        value={checked ?? false}
                        label={t(
                            "Keine anderen Buchungen im Zeitraum zulassen."
                        )}
                        onChange={setChecked}
                        bottomSpacing={2}
                    />

                    <Notice>
                        {t(
                            'Jeder Raum muss einzeln angefragt werden. Wenn du mehrere Räume für den gleichen Zeitraum anfragen möchtest, klicke nach dem Absenden dieser Anfrage auf "Anfrage kopieren"'
                        )}
                    </Notice>
                </>
            )}
        </>
    );
};

export default SetRoomSubpage;
