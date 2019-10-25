//export {useSelector as UseSelector} from "react-redux";
import {useSelector} from "react-redux";

export function UseSelector<TState, TSelected>(
	selector: (state: TState) => TSelected,
	equalityFn?: (left: TSelected, right: TSelected) => boolean,
): TSelected {
	return useSelector(selector, equalityFn);
}