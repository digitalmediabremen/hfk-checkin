import Title from "../components/common/Title"
import { useTranslation } from "../localization";


const Page404 = () => {
    const {t} = useTranslation();
    return <Title>{t("Seite nicht gefunden")}.</Title>
}

export default Page404;