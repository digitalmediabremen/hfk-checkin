import { isValidNumber } from "libphonenumber-js";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useCallback, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useUpdateProfile } from "../components/api/ApiHooks";
import { useAppState } from "../components/common/AppStateProvider";
import FormPhoneInput from "../components/common/FormPhoneInput";
import FormTextInput from "../components/common/FormTextInput";
import Layout from "../components/common/Layout";
import { LoadingInline } from "../components/common/Loading";
import NewButton from "../components/common/NewButton";
import Notice from "../components/common/Notice";
import SubPageBar from "../components/common/SubPageBar";
import { appUrls } from "../config";
import { useTranslation } from "../localization";
import MyProfile, { ProfileUpdate } from "../src/model/api/MyProfile";
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
    const { t } = useTranslation("setprofile");

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
        },
    });

    useEffect(() => {
        setValue("first_name", initialProfile?.first_name || "");
        setValue("last_name", initialProfile?.last_name || "");
        setValue("phone", initialProfile?.phone || "");
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
                            ? undefined
                            : () => router.push(appUrls.home)
                    }
                />
            }
        >
            <form
                onSubmit={handleSubmit(handleProfileUpdate)}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
            >
                <style jsx>{``}</style>
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
                    <Notice bottomSpacing={2}>
                        {t(
                            "Deine Daten werden ausschließlich im Falle einer Infektionsnachverfolgung verwendet. Mit der Registrierung bestätigst du, den Datenschutzhinweis der HfK gelesen und verstanden zu haben und mit der Erfassung deiner Daten zum Zwecke der Rückverfolgung bei einem Infektionsfall einverstanden zu sein. Du bestätigst das gültige HfK Hygienekonzept gelesen und verstanden zu haben und es zu befolgen. Die Datenschutzhinweise und die Hygieneregeln der HfK findest du auf Sie auf faq.hfk-bremen.de und https://www.hfk-bremen.de/corona-downloads und im Aushang am Empfang.",
                            {},
                            "setprofile-accept-legal"
                        )}
                    </Notice>
                )}
                {initialProfile?.phone && (
                    <Notice bottomSpacing={2}>
                        {t(
                            "Die Telefonnummer wird auschliesslich im Falle einer  Infektionsnachverfolgung verwendet."
                        )}
                    </Notice>
                )}
                <NewButton
                    disabled={loading}
                    primary
                    iconRight={loading ? <LoadingInline loading /> : undefined}
                >
                    {isUserCreation ? t("Erstellen") : t("Speichern")}
                </NewButton>
            </form>
        </Layout>
    );
};

export default EditProfilePage;
