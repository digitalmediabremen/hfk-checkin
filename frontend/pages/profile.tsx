import { useFormik, FormikValues } from "formik";
import { NextPage, NextPageContext, GetServerSideProps } from "next";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import PhoneInput from "../components/common/PhoneInput";
import Profile from "../model/User";
import FormGroup from "../components/common/FormGroup";
import { useAppState } from "../components/api/AppStateProvider";
import { useUpdateProfile } from "../components/api/ApiHooks";
import { getProfileRequest } from "../components/api/ApiService";

interface EditProfileProps {
    user?: Profile;
}

type Error<T> = {
    [Key in keyof T]?: string;
};

const validate = (user: Profile) => {
    const errors: Error<Profile> = {};
    if (!user.firstName) {
        errors.firstName = "Required";
    }

    if (!user.lastName) {
        errors.lastName = "Required";
    }

    if (!user.phone) {
        errors.phone = "Required";
    }

    return errors;
};

const EditProfilePage: NextPage<EditProfileProps> = (props) => {
    const user = props.user || {
        firstName: "",
        lastName: "",
        phone: "",
    };
    const isUserCreation = !props.user;

    const { dispatch } = useAppState();
    const { loading, updateProfile } = useUpdateProfile();


    const formik = useFormik({
        initialValues: {
            ...user,
        },
        validate,
        onSubmit: (values) => {
            updateProfile(formik.values)
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
                    value={formik.values.firstName}
                    disabled={!isUserCreation}
                    focus={isUserCreation}
                    error={formik.touched.firstName && formik.errors.firstName}
                />

                <Input
                    name="lastName"
                    label="Nachname"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.lastName}
                    disabled={!isUserCreation}
                    error={formik.touched.lastName && formik.errors.lastName}
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
    // api call
    // const profile: Profile = {
    //     firstName: "test",
    //     lastName: "test",
    //     phone: "01412312",
    //     authenticated: true,
    // };
    const { status, data: profile, error } = await getProfileRequest();

    if (error) return { props: {} };
    
    return {
        props: {
            profile
        },
    };
};

export default EditProfilePage;
