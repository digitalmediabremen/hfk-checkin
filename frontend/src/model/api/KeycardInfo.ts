export default interface KeycardInfo {
    readonly number: string | null;
    readonly requested_at: Date | null;
    readonly permissions_last_synced_at: Date | null;
    readonly permissions_last_modified_at: Date | null;
    readonly total_permission_count: number;
    readonly synced_permission_count: number;
    readonly not_synced_permission_count: number;
}
