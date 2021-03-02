import NewReservation from "./NewReservation";
import { AttendanceUpdate } from "./MyProfile";
import Resource from "./Resource";
import Unit from "./Unit";

type NewReservationBlueprint = Partial<Omit<NewReservation, "attendees">> & {
    resource?: Resource;
    units?: Unit[];
    selectedUnitId?: string;
    attendees?: AttendanceUpdate[];
};
export default NewReservationBlueprint;
