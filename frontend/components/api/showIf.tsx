import Error from 'next/error'
import Page404 from '../../pages/404';

const showIf = <P extends object>(
    condition: () => boolean,
    Component: React.ComponentType<P>
): React.FC<P> => (props) => {
    if (!condition()) return <Page404 />;
    return <Component {...(props as P)} />;
};



export default showIf;
