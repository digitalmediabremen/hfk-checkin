import { useEffect } from "react";
import { Workbox } from "workbox-window";
import { WorkboxLifecycleWaitingEvent } from "workbox-window/utils/WorkboxEvent";
import { isClient } from "../../config";

export default function useSWRefreshToUpdate() {
    useEffect(() => {
        if (
            isClient &&
            "serviceWorker" in navigator &&
            (window as any).workbox !== undefined
        ) {
            console.log("call it a hook");
            const wb = new Workbox("/sw.js");
            wb.addEventListener("installed", (event) => {
                if (event.isUpdate) {
                    console.log("reloaded due to sw update")
                    window.location.reload();
                }
            });
            // const promptNewVersionAvailable = (
            //     event: WorkboxLifecycleWaitingEvent
            // ) => {
            //     console.log("send skip waiting");
            //     wb.addEventListener("controlling", (event) => {
            //         console.log("reload caused by service worker update");
            //         window.location.reload();
            //     });

            //     // Send a message to the waiting service worker, instructing it to activate.
            //     wb.messageSkipWaiting();
            // };

            // wb.addEventListener("waiting", promptNewVersionAvailable);
            wb.register();
        }
    }, []);
}
