import { GetServerSideProps, GetStaticPropsContext } from "next";
import { backendUrl } from "../config";

const Page = () => null;

export default Page;

export async function getServerSideProps(context: GetServerSideProps) {
    return {
        redirect: {
            destination: backendUrl,
            permanent: true,
        },
    };
}
