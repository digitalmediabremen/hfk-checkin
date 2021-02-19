
export default interface Location {
    id: number;
    code: string;
    org_number: string;
    org_name: string;
    capacity: number; // -1 if root node. eg: speicher
    load: number;
    parent: Location;
}
