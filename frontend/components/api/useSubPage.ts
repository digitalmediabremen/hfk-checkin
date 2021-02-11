import { useState, useCallback, ReactNode } from "react";

const useSubPage = <SubPagesType extends string>() => {
    const [activeSubPage, setActiveSubPage] = useState<
        SubPagesType | undefined
    >();
    const [showSubPage, setShowSubPage] = useState(false);
    const subPageProps = useCallback(
        (subpage: SubPagesType, subpageContent: () => ReactNode) => ({
            subPageActive: activeSubPage === subpage,
            onClick: () => {
                setActiveSubPage(subpage);
                setShowSubPage(true);
            },
            onSubPageBack: () => setShowSubPage(false),
            subPageContent: subpageContent,
        }),
        [activeSubPage]
    );

    const pageProps = useCallback(() => ({
        showSubPage: showSubPage,
        onSubpageDeactivated: () => setActiveSubPage(undefined)
    }), [showSubPage]);

    return {
        activeSubPage,
        showSubPage,
        subPageProps,
        pageProps,
    }
};

export default useSubPage;
