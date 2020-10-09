import React from "react";
import { useFormik } from "formik";

const RegisterGuestForm = () => {
    const formik = useFormik({
        initialValues: {
            first_name: "",
            last_name: "",
            phone: "",
        },
        onSubmit: (values) => {
            alert(JSON.stringify(values, null, 2));
        },
    });
    return (
        <form onSubmit={formik.handleSubmit}>
            <label htmlFor="email">Email Address</label>
            <input
                id="email"
                name="email"
                type="email"
                onChange={formik.handleChange}
                value={formik.values.email}
            />
            <button type="submit">Submit</button>
        </form>
    );
};

export default RegisterGuestForm;
