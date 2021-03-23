import { useEffect, useRef } from "react";
import { usePageVisibility } from "react-page-visibility";
import { Workbox } from "workbox-window";
import {
    WorkboxLifecycleEvent,
    WorkboxLifecycleWaitingEvent,
} from "workbox-window/utils/WorkboxEvent";
import { isClient } from "../../config";

export default function useSWRefreshToUpdate() {
    const visible = usePageVisibility();
    const serviceWorkerRegistration = useRef<ServiceWorkerRegistration>();

    useEffect(() => {
        if (visible) serviceWorkerRegistration.current?.update();
    }, [visible, serviceWorkerRegistration]);

    useEffect(() => {
        if (
            !(
                isClient &&
                "serviceWorker" in navigator &&
                (window as any).workbox !== undefined
            )
        )
            return;

        const wb = new Workbox("/sw.js");
        const handleInstalled = (event: WorkboxLifecycleEvent) => {
            if (event.isUpdate) {
                console.log("reloaded due to sw update");
                window.location.reload(true);
            }
        };
        wb.addEventListener("installed", handleInstalled);

        wb.register().then((reg) => {
            serviceWorkerRegistration.current = reg;
        });

        return () => {
            wb.removeEventListener("installed", handleInstalled);
        };
    }, []);
}
