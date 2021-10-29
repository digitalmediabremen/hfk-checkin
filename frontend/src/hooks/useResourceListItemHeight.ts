import { calculateMinHeightSpacing } from "../../components/common/FormElementBase";
import { RESOURCE_LIST_ITEM_DENSITY } from "../../components/common/ResourceListItem";
import useTheme from "./useTheme";

export default function useResourceListItemHeight() {
    const theme = useTheme();

    const listItemHeight =
        theme.spacing(calculateMinHeightSpacing(RESOURCE_LIST_ITEM_DENSITY)) +
        1;

    return listItemHeight;
}