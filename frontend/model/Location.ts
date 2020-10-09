export interface Location {
    id: number;
    code: string;
    org_number: string;
    org_name: string;
    capacity: number;
    load: number;
    parent: Location;
}
