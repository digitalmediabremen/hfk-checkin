import { useFormik } from "formik";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useUpdateProfile } from "../components/api/ApiHooks";
import { useAppState } from "../components/common/AppStateProvider";
import { ButtonWithLoading } from "../components/common/Button";
import FormGroup from "../components/common/FormGroup";
import { Input } from "../components/common/Input";
import Layout from "../components/common/Layout";
import Notice from "../components/common/Notice";
import PhoneInput from "../components/common/PhoneInput";
import { appUrls } from "../config";
import { useTranslation } from "../localization";
import MyProfile, { ProfileUpdate } from "../src/model/api/MyProfile";

interface EditProfileProps {
    profile?: MyProfile;
}

type Error<T> = {
    [Key in keyof T]?: string;
};

const validate = (user: ProfileUpdate, t: { required: string }) => {
    const errors: Error<ProfileUpdate> = {};
    if (!user.first_name) {
        errors.first_name = t.required;
    }

    if (!user.last_name) {
        errors.last_name = t.required;
    }

    if (!user.phone) {
        errors.phone = t.required;
    }

    return errors;
};

const EditProfilePage: NextPage<EditProfileProps> = (props) => {
    const { appState, dispatch } = useAppState();
    const { myProfile: initialProfile } = appState;

    const user = initialProfile || {
        first_name: "",
        last_name: "",
        phone: "",
    };
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

    const validationErrors = {
        required: t("erforderlich"),
    };

    const formik = useFormik<ProfileUpdate>({
        initialValues: {
            ...user,
            email: "",
        },
        validate: (user) => validate(user, validationErrors),
        enableReinitialize: true,
        onSubmit: (values) => {
            updateProfile(formik.values);
        },
    });

    if (!appState.initialized) return null;

    return (
        <Layout>
            <form
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                onSubmit={formik.handleSubmit}
            >
                <FormGroup>
                    <Input
                        name="first_name"
                        label={t("Vorname")}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.first_name}
                        disabled={!isUserCreation}
                        focus={isUserCreation}
                        error={
                            formik.touched.first_name &&
                            formik.errors.first_name
                                ? formik.errors.first_name
                                : undefined
                        }
                    />

                    <Input
                        name="last_name"
                        label={t("Nachname")}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.last_name}
                        disabled={!isUserCreation}
                        error={
                            formik.touched.last_name && formik.errors.last_name
                                ? formik.errors.last_name
                                : undefined
                        }
                    />
                </FormGroup>
                <FormGroup>
                    <PhoneInput
                        name="phone"
                        label={t("Telefonnummer")}
                        onPhoneNumberChange={(phone) =>
                            formik.setFieldValue("phone", phone)
                        }
                        onBlur={formik.handleBlur}
                        value={formik.values.phone || ""}
                        focus={!isUserCreation}
                        error={
                            formik.touched.phone && formik.errors.phone
                                ? formik.errors.phone
                                : undefined
                        }
                    />
                    {!initialProfile?.phone && (
                        <Notice>
                            {t(
                                "Deine Daten werden ausschließlich im Falle einer Infektionsnachverfolgung verwendet. Mit der Registrierung bestätigst du, den Datenschutzhinweis der HfK gelesen und verstanden zu haben und mit der Erfassung deiner Daten zum Zwecke der Rückverfolgung bei einem Infektionsfall einverstanden zu sein. Du bestätigst das gültige HfK Hygienekonzept gelesen und verstanden zu haben und es zu befolgen. Die Datenschutzhinweise und die Hygieneregeln der HfK findest du auf Sie auf faq.hfk-bremen.de und https://www.hfk-bremen.de/corona-downloads und im Aushang am Empfang.",
                                {},
                                "setprofile-accept-legal"
                            )}
                        </Notice>
                    )}
                </FormGroup>

                <ButtonWithLoading
                    loading={loading}
                    disabled={!formik.dirty || !formik.isValid}
                    onClick={() => {}}
                >
                    {isUserCreation ? t("Registrieren") : t("Speichern")}
                </ButtonWithLoading>
            </form>
        </Layout>
    );
};

export default EditProfilePage;
