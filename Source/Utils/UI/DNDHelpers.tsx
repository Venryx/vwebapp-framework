import {Draggable} from "react-beautiful-dnd";
import {GetDOM} from "react-vextensions";
import React from "react";
import {ToJSON} from "js-vextensions";

// So why do we have a MakeDraggable decorator but not a MakeDroppable one?
// Basically, it's just that <Droppable> sections are usually not the root of a component, whereas <Draggable> sections almost always are.
// Thus, a MakeDroppable decorator just wouldn't be very useful. (ie. it would have few components using)

type DraggableCompProps = {type: string, draggableInfo: DraggableInfo, index: number};
export type DragInfo = {provided, snapshot};
type DraggableInfo = any; // this is up to the parent project

export function MakeDraggable(getDraggableCompProps: (props: Object)=>DraggableCompProps) {
	return WrappedComponent=>{
		class WrapperComponent extends React.Component {
			static WrappedComponent = WrappedComponent;
			static displayName = WrapperComponent.displayName;

			UNSAFE_componentWillMount() {
				this.UpdateDraggableCompProps(this.props);
			}
			UNSAFE_componentWillReceiveProps(props) {
				this.UpdateDraggableCompProps(props);
			}

			compProps: DraggableCompProps;
			/*type: string;
			draggableInfo: DraggableInfo;
			index: number;*/
			UpdateDraggableCompProps(props) {
				/*const {type, draggableInfo, index} = getDraggableCompProps(props);
				this.type = type;
				this.draggableInfo = draggableInfo;
				this.index = index;*/
				this.compProps = getDraggableCompProps(props);
			}

			render() {
				if (this.compProps == null) {
					return <WrappedComponent {...this.props} dragInfo={null}/>;
				}

				return (
					<Draggable type={this.compProps.type} draggableId={ToJSON(this.compProps.draggableInfo)} index={this.compProps.index}>
						{(provided, snapshot)=>{
							const dragInfo = {provided, snapshot};
							return <WrappedComponent {...this.props} ref={c=>provided.innerRef(GetDOM(c))} dragInfo={dragInfo}/>;
						}}
					</Draggable>
				);
			}
		}
		return WrapperComponent as any;
	};
}