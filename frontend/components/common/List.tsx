import React from "react";
import theme from "../../styles/theme";

interface ListProps { }

const List: React.FunctionComponent<ListProps> = ({
    children
}) => {
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