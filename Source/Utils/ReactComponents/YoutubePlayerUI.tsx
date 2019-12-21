import React, {Ref} from "react";
import {BaseComponent, BaseComponentPlus} from "react-vextensions";
import {Row} from "react-vcomponents";
import {YoutubePlayer, PosChangeSource} from "../General/YoutubePlayer";

export class YoutubePlayerUI extends BaseComponentPlus(
	{heightVSWidthPercent: .75, autoplay: false, onPosChanged_callForStartTime: true} as {
		videoID: string, startTime?: number, heightVSWidthPercent: number, autoplay?: boolean,
		initPlayer?: (player: YoutubePlayer)=>any,
		onPlayerInitialized?: (player: YoutubePlayer)=>any,
		onPosChanged?: (position: number, source: PosChangeSource)=>any,
		onPosChanged_callForStartTime?: boolean,
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
		const {videoID, startTime, autoplay, initPlayer, onPlayerInitialized, onPosChanged, onPosChanged_callForStartTime} = this.props;
		const player = new YoutubePlayer();
		if (initPlayer) initPlayer(player);
		this.player = player;

		player.containerUI = this.root;
		await player.EnsureReady();
		if (!this.mounted) return;

		if (onPlayerInitialized) onPlayerInitialized(player);
		player.LoadVideo({videoID, startTime}, autoplay);
		if (onPosChanged_callForStartTime && startTime != null && onPosChanged) {
			onPosChanged(startTime, "playback"); // it's not really either source, but it's closer to playback
		}

		if (onPosChanged) player.onPositionChanged = onPosChanged;
	}
}