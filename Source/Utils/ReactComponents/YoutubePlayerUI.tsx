import React, {Ref} from "react";
import {BaseComponent, BaseComponentPlus} from "react-vextensions";
import {Row} from "react-vcomponents";
import {YoutubePlayer} from "../General/YoutubePlayer";

export class YoutubePlayerUI extends BaseComponentPlus(
	{heightVSWidthPercent: .75, autoplay: false} as {
		videoID: string, startTime?: number, heightVSWidthPercent: number, autoplay?: boolean,
		initPlayer?: (player: YoutubePlayer)=>any,
		onPlayerInitialized?: (player: YoutubePlayer)=>any,
		onPosChanged?: (position: number)=>any,
		style?,
	},
) {
	player: YoutubePlayer;
	root: HTMLDivElement;
	render() {
		const {heightVSWidthPercent, style} = this.props;
		return (
			<div ref={c=>this.root = c} style={E({position: "relative", paddingBottom: `${heightVSWidthPercent * 100}%`, height: 0}, style)}>
			</div>
		);
	}

	async ComponentDidMount() {
		const {videoID, startTime, autoplay, initPlayer, onPlayerInitialized, onPosChanged} = this.props;
		const player = new YoutubePlayer();
		if (initPlayer) initPlayer(player);
		this.player = player;

		player.containerUI = this.root;
		await player.EnsureReady();
		if (!this.mounted) return;

		if (onPlayerInitialized) onPlayerInitialized(player);
		player.LoadVideo({videoID, startTime}, autoplay);

		if (onPosChanged) player.onPositionChanged = onPosChanged;
	}
}