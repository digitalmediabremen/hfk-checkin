import { DeepPartial } from "../../util/TypeUtil";
import NewReservation from "./NewReservation";
import Resource from "./Resource";

type NewReservationBlueprint = Partial<NewReservation> & {
    resource?: Resource;
};
export default NewReservationBlueprint;
