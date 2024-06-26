import { DeepRemoveNull, DeepWritable } from "../../util/TypeUtil";
import Reservation from "./Reservation";

type NewReservation = DeepRemoveNull<DeepWritable<Reservation>> & {
    templateId?: string;
};
export default NewReservation;
// ToDo: remove null