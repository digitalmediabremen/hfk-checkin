import classNames from "classnames";
import useTheme from "../../src/hooks/useTheme";
const Bar: React.FunctionComponent<{ extendedWidth?: boolean }> = ({
    extendedWidth,
    children,
}) => {
    const theme = useTheme();
    return (
        <>
            <style jsx>{`
                .bar {
                    padding: ${theme.spacing(1)}px ${theme.spacing(3)}px;
                    display: flex;
                    align-items: center;
                    min-height: 100%;
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