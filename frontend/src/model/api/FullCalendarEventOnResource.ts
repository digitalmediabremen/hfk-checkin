export default interface FullCalendarEventOnResource {
    display?:
        | "auto"
        | "block"
        | "list-item"
        | "background"
        | "inverse-background"
        | "none";
    start: string | Date;
    end: string | Date;
    id?: string;
    identifier?: string;
    resourceId?: string;
    color?: string;
    title?: string;
}
