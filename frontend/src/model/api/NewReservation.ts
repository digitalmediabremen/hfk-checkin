import { DeepWritable } from "../../util/TypeUtil";
import Reservation from "./Reservation";

type NewReservation = DeepWritable<Reservation>;
export default NewReservation;
