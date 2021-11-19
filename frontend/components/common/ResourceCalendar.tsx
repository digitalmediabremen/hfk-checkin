import React from "react";
import { AvailableHeight } from "./AlignContent";

interface ResourceCalendarProps {}

const ResourceCalendar: React.FunctionComponent<ResourceCalendarProps> =
    ({}) => {
        return (
            <>
                <style jsx>{``}</style>
                <AvailableHeight>
                    {(cssAvailableHeight) => (
                        <div
                            style={{
                                width: "100%",
                                display: "block",
                                height: cssAvailableHeight,
                                background: "gray",
                            }}
                        >
                            calendar
                        </div>
                    )}
                </AvailableHeight>
            </>
        );
    };

export default ResourceCalendar;
