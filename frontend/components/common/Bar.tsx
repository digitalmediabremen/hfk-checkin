import classNames from "classnames";
import useTheme from "../../src/hooks/useTheme";
const Bar: React.FunctionComponent<{
    extendedWidth?: boolean;
    maxWidth?: true;
}> = ({ extendedWidth, maxWidth, children }) => {
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

                .bar.max-width {
                    max-width: ${500 + theme.spacing(3) - 4}px;
                }

                @media screen and (min-width: 500px) {
                    .bar.max-width {
                        margin: 0 auto;
                        padding: ${theme.spacing(1)}px ${theme.spacing(0)}px;
                    }

                    .bar.max-width.extended-width {
                        padding: ${theme.spacing(1)}px 0;
                    }
                }

                .bar.extended-width {
                    padding: ${theme.spacing(1)}px ${theme.spacing(1.5) + 1}px;
                }
            `}</style>
            <div
                className={classNames("bar", {
                    "extended-width": extendedWidth,
                    "max-width": maxWidth,
                })}
            >
                {children}
            </div>
        </>
    );
};

export default Bar;
