// general
// ==========

// will try to finish this once I have more experience with react-hooks
/* export function UseCheckStillHoveredTimer() {
	let checkStillHoveredTimer;
	useEffect(()=>{
		checkStillHoveredTimer = new Timer(100, ()=>{
			const dom = GetDOM(this.root);
			if (dom == null) {
				checkStillHoveredTimer.Stop();
				return;
			}
			const mainRect = VRect.FromLTWH(dom.getBoundingClientRect());

			const leftBoxDOM = dom.querySelector(".NodeUI_LeftBox");
			const leftBoxRect = leftBoxDOM ? VRect.FromLTWH(leftBoxDOM.getBoundingClientRect()) : null;

			const mouseRect = new VRect(mousePos, new Vector2i(1, 1));
			const intersectsOne = mouseRect.Intersects(mainRect) || (leftBoxRect && mouseRect.Intersects(leftBoxRect));
			// Log(`Main: ${mainRect} Mouse:${mousePos} Intersects one?:${intersectsOne}`);
			setHovered(intersectsOne);
		});
		return ()=>checkStillHoveredTimer.Stop(); // cleanup func
	}, []);
	return checkStillHoveredTimer;
} */