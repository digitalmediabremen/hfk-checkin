import React from "react";
import Layout from "../components/common/Page";
import Title from "../components/common/Title";
import { useTranslation } from "../localization";

const Page404 = () => {
    const { t } = useTranslation();
    return (
        <Layout>
            <Title>{t("Seite nicht gefunden")}.</Title>
        </Layout>
    );
};

export default Page404;
