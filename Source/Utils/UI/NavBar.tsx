import {E} from "js-vextensions";
import {runInAction} from "mobx";
import React, {useCallback} from "react";
import {BaseComponentPlus} from "react-vextensions";
import {manager} from "../../Manager";
import {RootStore} from "../../UserTypes";
import {Link} from "../ReactComponents/Link";
import {Observer} from "../Store/MobX";

// todo: someday move the NavBar comp itself here (probably)

@Observer
export class NavBarButton extends BaseComponentPlus(
	{} as {page?: string, text: string, panel?: boolean, active?: boolean, style?, onClick?: (e)=>void},
	{hovered: false},
) {
	render() {
		let {page, text, active, style, onClick} = this.props;
		// let {_radiumStyleState: {main: radiumState = {}} = {}} = this.state as any;
		// let {_radiumStyleState} = this.state as any;
		const {hovered} = this.state;
		const largeVersion = manager.useExpandedNavBar();

		const currentPage = manager.store.main.page;
		active = active != null ? active : page == currentPage;
		const pageEntry = manager.pageTree.children[page];

		const finalStyle = E(
			{
				position: "relative", display: "inline-block", cursor: "pointer", verticalAlign: "middle",
				lineHeight: largeVersion ? "45px" : "25px", color: "#FFF", padding: "0 15px", fontSize: 12, textDecoration: "none", opacity: 0.9,
			},
			style,
		);

		//const actionFunc = page ? (s: RootStore)=>{
		const actionFunc = page ? (s: any)=>{
			if (page != currentPage) {
				s.main.page = page;
			} else {
				const pageStore = s.main[currentPage];
				const newSubpage = manager.pageTree.children[currentPage].DefaultChild;
				// go to the page root-contents, if clicking on page in nav-bar we're already on
				if (pageStore.subpage != newSubpage) {
					//s.main[currentPage].subpage = null;
					pageStore.subpage = newSubpage;
				} else {
					if (newSubpage) {
						const subpageEntry = pageEntry.children[newSubpage];
						if (subpageEntry.actionIfActive) {
							//runInAction("NavBarPageButton.subpage.actionIfActive", ()=>subpageEntry.actionIfActive(s));
							subpageEntry.actionIfActive(s);
						}
					}
					if (pageEntry.actionIfActive) {
						pageEntry.actionIfActive(s);
						//runInAction("NavBarPageButton.actionIfActive", ()=>pageEntry.actionIfActive(s));
					}
				}
			}
		} : null;

		const hoverOrActive = hovered || active;
		return (
			<Link actionFunc={actionFunc} style={finalStyle} onMouseEnter={useCallback(()=>this.SetState({hovered: true}), [])} onMouseLeave={useCallback(()=>this.SetState({hovered: false}), [])} onClick={onClick}>
				{text}
				{hoverOrActive &&
					<div style={{position: "absolute", left: 0, right: 0, bottom: 0, height: 2, background: "rgba(100,255,100,1)"}}/>}
			</Link>
		);
	}
}

@Observer
export class NavBarPageButton extends BaseComponentPlus({} as {page?: string, text: string, style?}, {}) {
	render() {
		const {...rest} = this.props;
		return (
			<NavBarButton {...rest}/>
		);
	}
}

@Observer
export class NavBarPanelButton extends BaseComponentPlus({} as {text: string, panel: string, hasPage?: boolean, corner: "top-left" | "top-right"}, {}, {active: false}) {
	render() {
		const {text, panel, hasPage, corner} = this.props;
		const {topLeftOpenPanel, topRightOpenPanel} = manager.store.main;
		const active = (corner == "top-left" ? topLeftOpenPanel : topRightOpenPanel) == panel;

		this.Stash({active});
		return (
			<NavBarButton page={hasPage ? panel : null} text={text} panel={true} active={active} onClick={this.OnClick}/>
		);
	}
	OnClick = (e: MouseEvent)=>{
		e.preventDefault();
		const {corner, panel, active} = this.PropsStateStash;
		runInAction("NavBarPanelButton_OnClick", ()=>{
			if (corner == "top-left") {
				manager.store.main.topLeftOpenPanel = active ? null : panel;
			} else {
				manager.store.main.topRightOpenPanel = active ? null : panel;
			}
		});
	};
}