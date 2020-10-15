import { useFormik } from "formik";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useUpdateProfile } from "../components/api/ApiHooks";
import { getProfileRequest } from "../components/api/ApiService";
import { ButtonWithLoading } from "../components/common/Button";
import FormGroup from "../components/common/FormGroup";
import { Input } from "../components/common/Input";
import PhoneInput from "../components/common/PhoneInput";
import { appUrls } from "../config";
import { useTranslation, withLocaleProp } from "../localization";
import Profile, { ProfileUpdate } from "../model/Profile";
import { useAppState } from "../components/common/AppStateProvider";

interface EditProfileProps {
    profile?: Profile;
}

type Error<T> = {
    [Key in keyof T]?: string;
};

const validate = (user: ProfileUpdate) => {
    const errors: Error<ProfileUpdate> = {};
    if (!user.first_name) {
        errors.first_name = "erforderlich";
    }

    if (!user.last_name) {
        errors.last_name = "erforderlich";
    }

    if (!user.phone) {
        errors.phone = "erforderlich";
    }

    return errors;
};

const EditProfilePage: NextPage<EditProfileProps> = (props) => {
    const user = props.profile || {
        first_name: "",
        last_name: "",
        phone: "",
    };
    const isUserCreation = !props.profile;

    const { loading, success, updateProfile, result: updatedProfile } = useUpdateProfile();
    const router = useRouter();
    const { t } = useTranslation("setprofile");
    const { dispatch } = useAppState();

    useEffect(() => {
        if (!success) return;
        if (!!updatedProfile) {
            dispatch({
                type: "profile",
                profile: updatedProfile
            })
        }
        if (!!updatedProfile && !updatedProfile.verified) {
            router.push(appUrls.verifyProfile);
            return;
        }
        router.push(appUrls.enterCode);
    }, [success]);

    const formik = useFormik<ProfileUpdate>({
        initialValues: {
            ...user,
        },
        validate,
        onSubmit: (values) => {
            updateProfile(formik.values);
        },
    });
    return (
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
                        formik.touched.first_name && formik.errors.first_name
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
                    value={formik.values.phone}
                    focus={!isUserCreation}
                    error={
                        formik.touched.phone && formik.errors.phone
                            ? formik.errors.phone
                            : undefined
                    }
                />
            </FormGroup>
            <ButtonWithLoading
                loading={loading}
                disabled={!formik.dirty || !formik.isValid}
                onClick={() => {}}
            >
                {isUserCreation ? t("Registrieren") : t("Speichern") }
            </ButtonWithLoading>
            <p>
                {t(
                    `Deine Angaben werden ausschließlich 
                    zur Nachverfolgung im Infektionsfall verwendet.`,
                    {},
                    "data-protection-notice"
                )}
            </p>
        </form>
    );
};

export const getServerSideProps: GetServerSideProps = withLocaleProp(
    async (context) => {
        const cookie = context.req.headers.cookie!;
        const empty = { props: {} };

        const { status, data: profile, error } = await getProfileRequest({
            cookie,
        });

        if (!!error) return {
            props: {
                status
            }
        };

        // redirect if phone already present
        // if (!!profile?.phone) redirectServerSide(context.res, appUrls.enterCode);

        return {
            props: {
                profile,
            },
        };
    }
);

export default EditProfilePage;
