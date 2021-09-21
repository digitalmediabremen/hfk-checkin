import { isValidNumber } from "libphonenumber-js";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useCallback, useEffect } from "react";
import { CreditCard } from "react-feather";
import { Controller, useForm } from "react-hook-form";
import SmoothCollapse from "react-smooth-collapse";
import { isNonNullExpression } from "typescript";
import { useUpdateProfile } from "../components/api/ApiHooks";
import AlignContent from "../components/common/AlignContent";
import { useAppState } from "../components/common/AppStateProvider";
import Divider from "../components/common/Divider";
import FormElement from "../components/common/FormElement";
import FormPhoneInput from "../components/common/FormPhoneInput";
import FormTextInput from "../components/common/FormTextInput";
import Layout from "../components/common/Layout";
import { LoadingInline } from "../components/common/Loading";
import NewButton from "../components/common/NewButton";
import NewFormGroup from "../components/common/NewFormGroup";
import Notice from "../components/common/Notice";
import SectionTitle from "../components/common/SectionTitle";
import SubPageBar from "../components/common/SubPageBar";
import { appUrls } from "../config";
import { useTranslation } from "../localization";
import useColorSchemeSetting, {
    ColorSchemeSetting,
} from "../src/hooks/useColorSchemeSetting";
import useRequestKeycard from "../src/hooks/useRequestKeycard";
import Locale from "../src/model/api/Locale";
import MyProfile, { ProfileUpdate } from "../src/model/api/MyProfile";
import { getFormattedDate } from "../src/util/DateTimeUtil";
import { getLocaleLabelMap } from "../src/util/LocaleUtil";
import { Entries } from "../src/util/ReservationUtil";

interface EditProfileProps {
    profile?: MyProfile;
}

const EditProfilePage: NextPage<EditProfileProps> = (props) => {
    const { appState, dispatch } = useAppState();
    const { myProfile: initialProfile } = appState;

    const isUserCreation = !initialProfile;
    const {
        loading,
        success,
        updateProfile,
        result: updatedProfile,
    } = useUpdateProfile();
    const router = useRouter();
    const { t, locale: currentLocale } = useTranslation("setprofile");
    const localeMap = getLocaleLabelMap(currentLocale);
    const colorSchemeMap: Record<ColorSchemeSetting, string> = {
        auto: t("Automatisch"),
        light: t("Hell"),
        dark: t("Dunkel"),
    };
    const { colorSchemeSetting, handleColorSchemeSettingChange } =
        useColorSchemeSetting();

    const handleLocaleChange = (locale: Locale) => {
        setValue("preferred_language", locale);
        dispatch({
            type: "updateLocale",
            locale,
        });
    };

    useEffect(() => {
        if (!success) return;
        if (!!updatedProfile) {
            dispatch({
                type: "profile",
                profile: updatedProfile,
            });
        }
        if (!!updatedProfile && !updatedProfile.verified) {
            router.push(appUrls.verifyNow);
            return;
        }
        router.push(appUrls.home);
    }, [success]);

    const { errors, handleSubmit, control, setValue, watch } =
        useForm<ProfileUpdate>({
            mode: "onTouched",
            defaultValues: {
                first_name: initialProfile?.first_name || "",
                last_name: initialProfile?.last_name || "",
                phone: initialProfile?.phone || "",
                keycard_number: initialProfile?.keycard_number || "",
                preferred_language:
                    initialProfile?.preferred_language ||
                    appState.currentLocale,
            },
        });

    useEffect(() => {
        setValue("first_name", initialProfile?.first_name || "");
        setValue("last_name", initialProfile?.last_name || "");
        setValue("phone", initialProfile?.phone || "");
        setValue("keycard_number", initialProfile?.keycard_number);
        setValue(
            "preferred_language",
            initialProfile?.preferred_language || appState.currentLocale
        );
    }, [initialProfile]);

    const controllerProps = useCallback(
        (name: keyof ProfileUpdate, translatedName: string, rules?: {}) => ({
            mode: "onTouched",
            name,
            control,
            rules: {
                required: t("{fieldName} darf nicht leer sein.", {
                    fieldName: translatedName,
                }),
                ...rules,
            },
            error: errors[name]?.message,
            label: translatedName,
            key: name,
        }),
        [errors, control]
    );

    const handleProfileUpdate = (value: ProfileUpdate) => {
        updateProfile(value);
    };

    const currentKeycardNumber = watch("keycard_number");

    const handleLogout = () => {
        const confirm = window.confirm(t("Wirklich ausloggen?"));
        if (confirm) router.push(appUrls.logout);
    };

    const title = isUserCreation ? t("Profil erstellen") : t("Profil ändern");

    const keycardState = (() => {
        // return "empty";
        if (initialProfile?.keycard_number) return "added";
        else if (!initialProfile?.keycard_number) return "empty";
        else if (initialProfile?.keycard_requested_at_at) return "requested";
        throw new Error("invalid keycard state");
    })();

    const requestKeycardApi = useRequestKeycard();

    const handleRequestKeycard = () => {
        const confirm = window.confirm(
            t("Willst du wirklich eine neue Schlüsselkarte beantragen?")
        );
        if (!confirm) return;
        requestKeycardApi.request();
    };

    // update profile state if keycard was requested successfully
    useEffect(() => {
        if (requestKeycardApi.state != "success") return;
        dispatch({
            type: "profile",
            profile: requestKeycardApi.result,
        });
    }, [requestKeycardApi.state]);

    if (!appState.initialized) return null;
    return (
        <Layout
            title={title}
            overrideHeader={
                <SubPageBar
                    title={title}
                    onBack={
                        !!isUserCreation
                            ? () => router.push(appUrls.createProfile)
                            : () => router.push(appUrls.home)
                    }
                />
            }
        >
            {!isUserCreation && (
                <>
                    <SectionTitle noMarginBottom>
                        {t("Eingeloggt als")}
                    </SectionTitle>
                    <FormElement
                        value={initialProfile?.display_name}
                        noOutline
                        noPadding
                        density="super-narrow"
                        bottomSpacing={3}
                        actionIcon={
                            <NewButton
                                componentType="a"
                                noBottomSpacing
                                noOutline
                                noPadding
                                onClick={handleLogout}
                            >
                                {t("Ausloggen")}
                            </NewButton>
                        }
                    />
                </>
            )}
            <form
                onSubmit={handleSubmit(handleProfileUpdate)}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
            >
                <style jsx>{``}</style>
                {isUserCreation && (
                    <>
                        <Controller
                            as={<FormTextInput disabled={!isUserCreation} />}
                            {...controllerProps("first_name", t("Vorname"))}
                        />
                        <Controller
                            as={
                                <FormTextInput
                                    bottomSpacing={4}
                                    disabled={!isUserCreation}
                                />
                            }
                            {...controllerProps("last_name", t("Nachname"))}
                        />
                    </>
                )}

                <Controller
                    as={<FormPhoneInput bottomSpacing={1} />}
                    {...controllerProps("phone", t("Telefonnummer"), {
                        validate: (value: string) =>
                            !isValidNumber(value, "DE")
                                ? t("Keine gültige Telefonnummer")
                                : undefined,
                    })}
                />
                {!initialProfile?.phone && (
                    <Notice bottomSpacing={3}>
                        {t(
                            "Deine Daten werden ausschließlich im Falle einer Infektionsnachverfolgung verwendet. Mit der Registrierung bestätigst du, den Datenschutzhinweis der HfK gelesen und verstanden zu haben und mit der Erfassung deiner Daten zum Zwecke der Rückverfolgung bei einem Infektionsfall einverstanden zu sein. Du bestätigst das gültige HfK Hygienekonzept gelesen und verstanden zu haben und es zu befolgen. Die Datenschutzhinweise und die Hygieneregeln der HfK findest du auf Sie auf faq.hfk-bremen.de und https://www.hfk-bremen.de/corona-downloads und im Aushang am Empfang.",
                            {},
                            "setprofile-accept-legal"
                        )}
                    </Notice>
                )}
                {initialProfile?.phone && (
                    <Notice bottomSpacing={3}>
                        {t(
                            "Die Telefonnummer wird im Falle einer Infektionsnachverfolgung verwendet."
                        )}
                    </Notice>
                )}
                <Divider />
                {keycardState === "empty" && (
                    <>
                        <SectionTitle>{t("Schliesskarte")}</SectionTitle>
                        <Notice bottomSpacing={2}>
                            {t(
                                "Die Schließkarten bzw. -chips werden von der Hausverwaltung (Dezernat 4) ausgegeben und mit den gültigen Schließberechtigungen ausgestattet."
                            )}
                            <br />
                            <br />
                            {t(
                                "Wenn du bereits eine Karte besitzt, dann trage die Nummer jetzt hier ein."
                            )}
                        </Notice>
                        <Controller
                            as={<FormTextInput type="tel" bottomSpacing={3} />}
                            {...controllerProps(
                                "keycard_number",
                                t("Schliesskartennummer"),
                                { required: undefined }
                            )}
                        />

                        <SmoothCollapse expanded={!currentKeycardNumber}>
                            <Notice bottomSpacing={2}>
                                {t(
                                    "Noch keine Schließkarte bzw. -chip? Nach der Beantragung via Getin kann dein neuer Chip nach einer Woche persönlich gegen Unterschrift bei der Hausverwaltung (Dezernat 4, Raum XX.XX.XXX) abgeholt werden. Fragen zu Schließkarten bitte an mailto:schluessel@hfk-bremen.de."
                                )}
                            </Notice>
                            <NewButton
                                bottomSpacing={3}
                                density="narrow"
                                componentType="div"
                                onClick={handleRequestKeycard}
                            >
                                {t("Karte beantragen")}
                            </NewButton>
                        </SmoothCollapse>
                    </>
                )}
                {keycardState === "added" && (
                    <>
                        <SectionTitle bottomSpacing={1}>
                            {t("Schliesskarte")}
                        </SectionTitle>
                        <Notice bottomSpacing={2}>
                            {t(
                                "Die Schließkarten bzw. -chips werden von der Hausverwaltung (Dezernat 4) ausgegeben und mit den gültigen Schließberechtigungen ausgestattet."
                            )}
                        </Notice>

                        <FormElement
                            labelIcon={<CreditCard />}
                            value={initialProfile?.keycard_number}
                            density="super-narrow"
                            noOutline
                            noPadding
                            bottomSpacing={1}
                        />

                        <Notice bottomSpacing={2}>
                            {t(
                                "Deine Schliesskartennummer kann nachträglich nicht mehr geändert werden."
                            )}
                        </Notice>
                    </>
                )}

                {keycardState === "requested" && (
                    <>
                        <SectionTitle bottomSpacing={1}>
                            {t("Schliesskarte")}
                        </SectionTitle>

                        <FormElement
                            labelIcon={<CreditCard strokeWidth={1} />}
                            value={[
                                <b>{t("Angefragt")}</b>,
                                t("am {requested}", {
                                    requested: `${getFormattedDate(
                                        initialProfile?.keycard_requested_at_at ||
                                            undefined,
                                        currentLocale
                                    )}`,
                                }),
                            ]}
                            density="super-narrow"
                            noOutline
                            noPadding
                            bottomSpacing={2}
                        />
                        <Notice bottomSpacing={2}>
                            {t(
                                "Die Schließkarten bzw. -chips werden von der Hausverwaltung (Dezernat 4) ausgegeben und mit den gültigen Schließberechtigungen ausgestattet."
                            )}
                        </Notice>
                        <Notice bottomSpacing={3}>
                            {t(
                                "Deine Karte kann nach einer Woche persönlich gegen Unterschrift bei der Hausverwaltung (Dezernat 4, Raum XX.XX.XXX) abgeholt werden. Fragen zu Schließkarten bitte an {email}.",
                                {
                                    email: "schluessel@hfk-bremen.de",
                                }
                            )}
                        </Notice>
                    </>
                )}

                <Divider />
                <SectionTitle>{t("Sprache")}</SectionTitle>
                <Controller
                    control={control}
                    name="preferred_language"
                    render={(field) => (
                        <NewFormGroup bottomSpacing={3}>
                            {Object.entries(localeMap).map(
                                ([locale, label]) => (
                                    <FormElement
                                        primary={field.value === locale}
                                        density="super-narrow"
                                        value={label}
                                        adaptiveWidth
                                        key={locale}
                                        noBottomSpacing
                                        onClick={() =>
                                            handleLocaleChange(
                                                locale as unknown as Locale
                                            )
                                        }
                                    />
                                )
                            )}
                        </NewFormGroup>
                    )}
                />

                <SectionTitle>{t("Farben")}</SectionTitle>

                <NewFormGroup bottomSpacing={3}>
                    {(
                        Object.entries<string>(colorSchemeMap) as Entries<
                            Record<ColorSchemeSetting, string>
                        >
                    ).map(([colorScheme, label]) => (
                        <FormElement
                            primary={colorSchemeSetting === colorScheme}
                            density="super-narrow"
                            value={label}
                            adaptiveWidth
                            key={colorScheme}
                            noBottomSpacing
                            onClick={() =>
                                handleColorSchemeSettingChange(colorScheme)
                            }
                        />
                    ))}
                </NewFormGroup>

                <AlignContent align="bottom" offsetBottomPadding>
                    <NewButton
                        disabled={loading}
                        primary
                        iconRight={
                            loading ? <LoadingInline loading /> : undefined
                        }
                        noBottomSpacing
                    >
                        {isUserCreation ? t("Erstellen") : t("Speichern")}
                    </NewButton>
                </AlignContent>
            </form>
        </Layout>
    );
};

export default EditProfilePage;
