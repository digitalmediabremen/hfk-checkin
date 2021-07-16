import { isValidNumber } from "libphonenumber-js";
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useCallback, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useUpdateProfile } from "../components/api/ApiHooks";
import AlignContent from "../components/common/AlignContent";
import { useAppState } from "../components/common/AppStateProvider";
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
import Title from "../components/common/Title";
import { appUrls } from "../config";
import { useTranslation } from "../localization";
import Locale from "../src/model/api/Locale";
import MyProfile, { ProfileUpdate } from "../src/model/api/MyProfile";
import { getLocaleLabelMap } from "../src/util/LocaleUtil";
import reservation from "./reservation";

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

    const { errors, handleSubmit, control, setValue } = useForm<ProfileUpdate>({
        mode: "onTouched",
        defaultValues: {
            first_name: initialProfile?.first_name || "",
            last_name: initialProfile?.last_name || "",
            phone: initialProfile?.phone || "",
            preferred_language:
                initialProfile?.preferred_language || appState.currentLocale,
        },
    });

    useEffect(() => {
        setValue("first_name", initialProfile?.first_name || "");
        setValue("last_name", initialProfile?.last_name || "");
        setValue("phone", initialProfile?.phone || "");
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

    const title = isUserCreation ? t("Profil erstellen") : t("Profil ändern");

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
                            <Link href={appUrls.logout} passHref>
                                <NewButton
                                    componentType="a"
                                    noBottomSpacing
                                    noOutline
                                    noPadding
                                >
                                    {t("Ausloggen")}
                                </NewButton>
                            </Link>
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
                    as={<FormPhoneInput />}
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
                <SectionTitle>{t("Sprache")}</SectionTitle>
                <Controller
                    control={control}
                    name="preferred_language"
                    render={(field) => (
                        <NewFormGroup>
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
