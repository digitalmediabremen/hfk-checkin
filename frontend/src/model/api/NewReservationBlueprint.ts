import NewReservation from "./NewReservation";
import { AttendanceUpdate } from "./MyProfile";
import Resource from "./Resource";

type NewReservationBlueprint = Partial<Omit<NewReservation, "attendees">> & {
    resource?: Resource;
    attendees?: AttendanceUpdate[];
};
export default NewReservationBlueprint;
