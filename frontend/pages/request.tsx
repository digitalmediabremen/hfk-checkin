import showIf from "../components/api/showIf";
import features from "../features";


const RequestRoomPage = () => (<>test</>)

export default showIf(() => features.getin, RequestRoomPage);