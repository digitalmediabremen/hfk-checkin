import Head from 'next/head'
import { GetServerSideProps } from 'next';
import { profile } from 'console';
import { getProfileRequest } from '../components/api/ApiService';

const IndexPage = () => {
    return <>:)</>;
}

export default IndexPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
    // api call
    const { data: profile, error, status } = await getProfileRequest(); 

    if (status === 403) {
        const { res } = context; 
        res.writeHead(302, {
            Location: 'new'
          });
          res.end();
        return { props: {}};
    }

    return {
        props: {},
    };
};