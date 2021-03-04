import React from "react";
import useTheme from "../../src/hooks/useTheme";
interface ListProps { }

const List: React.FunctionComponent<ListProps> = ({
    children
}) => {
    const theme = useTheme();
    return (
        <ul>
            <style jsx>{`
                ul {
                    margin: 0;
                    padding: ${theme.spacing(.5)}px 0 0 0;
                    width: 100%;
                }
            `}</style>
            {children}
        </ul>
    );
};

export default List;