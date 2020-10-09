import { useFormik, FormikValues } from "formik";
import { NextPage, NextPageContext, GetServerSideProps } from "next";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import PhoneInput from "../components/common/PhoneInput";
import Profile from "../model/Profile";
import FormGroup from "../components/common/FormGroup";
import { useAppState } from "../components/common/AppStateProvider";
import { useUpdateProfile } from "../components/api/ApiHooks";
import { getProfileRequest } from "../components/api/ApiService";
import { profile } from "console";

interface EditProfileProps {
    profile?: Profile;
}

type Error<T> = {
    [Key in keyof T]?: string;
};

const validate = (user: Profile) => {
    const errors: Error<Profile> = {};
    if (!user.first_name) {
        errors.first_name = "Required";
    }

    if (!user.last_name) {
        errors.last_name = "Required";
    }

    if (!user.phone) {
        errors.phone = "Required";
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

    const { dispatch } = useAppState();
    const { loading, success, updateProfile } = useUpdateProfile();

    const formik = useFormik({
        initialValues: {
            ...user,
        },
        validate,
        onSubmit: (values) => {
            updateProfile({ id:  props?.profile.id, ...formik.values });
            // alert(JSON.stringify(values, null, 2));
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
                    name="firstName"
                    label="Vorname"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.first_name}
                    disabled={!isUserCreation}
                    focus={isUserCreation}
                    error={
                        formik.touched.first_name && formik.errors.first_name
                    }
                />

                <Input
                    name="lastName"
                    label="Nachname"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.last_name}
                    disabled={!isUserCreation}
                    error={formik.touched.last_name && formik.errors.last_name}
                />
            </FormGroup>
            <FormGroup>
                <PhoneInput
                    name="phone"
                    label="Telefonnummer"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.phone}
                    focus={!isUserCreation}
                    error={formik.touched.phone && formik.errors.phone}
                />
            </FormGroup>
            <Button disabled={!formik.isValid} onClick={() => {}}>
                Registrieren
            </Button>
            <p>
                Deine Angaben werden ausschließlich zur Nachverfolgung im
                Infektionsfall verwendet.
            </p>
        </form>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const cookie = context.req.headers.cookie;
    const { status, data: profile, error } = await getProfileRequest({
        cookie,
    });

    console.error(status, error, profile);

    if (error) return { props: {} };

    return {
        props: {
            profile,
        },
    };
};

export default EditProfilePage;
