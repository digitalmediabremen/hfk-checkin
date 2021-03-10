import Unit from "./Unit";


export default interface Resource {
    readonly uuid: string;
    readonly name: string;
    readonly alternative_names: string | null;
    readonly display_name: string;
    readonly display_numbers: string | null;
    readonly unit: Unit;
    readonly access_restricted: boolean;
    readonly access_allowed_to_current_user: boolean;
    readonly capacity: number | null;
    readonly reservable_max_days_in_advance: number | null;
    readonly reservable_min_days_in_advance: number | null;

}