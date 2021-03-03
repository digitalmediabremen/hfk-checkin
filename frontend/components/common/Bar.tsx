import classNames from "classnames";
import theme from "../../styles/theme";

const Bar: React.FunctionComponent<{ extendedWidth?: boolean }> = ({
    extendedWidth,
    children,
}) => {
    return (
        <>
            <style jsx>{`
                .bar {
                    padding: ${theme.spacing(1)}px ${theme.spacing(3)}px;
                    display: flex;
                    align-items: center;
                    min-height: ${theme.spacing(8)}px;
                }

                .bar.extendedWidth {
                    padding: ${theme.spacing(1)}px ${theme.spacing(1.5) + 1}px;
                }
            `}</style>
            <div
                className={classNames("bar", {
                    extendedWidth,
                })}
            >
                {children}
            </div>
        </>
    );
};

export default Bar;