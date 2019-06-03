import React from "react";
import {BaseComponent} from "react-vextensions";
import {Row} from "react-vcomponents";
import {YoutubePlayer} from "../General/YoutubePlayer";

export class YoutubePlayerUI extends BaseComponent<{videoID: string, startTime?: number, heightVSWidthPercent: number, autoplay: boolean, initPlayer?: (player: YoutubePlayer)=>any, onPlayerInitialized?: (player: YoutubePlayer)=>any}, {}> {
	static defaultProps = {heightVSWidthPercent: .75, autoplay: false};

	player: YoutubePlayer;
	root: HTMLDivElement;
	render() {
		const {heightVSWidthPercent} = this.props;
		return (
			<div ref={c=>this.root = c} style={{position: "relative", paddingBottom: `${heightVSWidthPercent * 100}%`, height: 0}}>
			</div>
		);
	}

	async ComponentDidMount() {
		const {videoID, startTime, autoplay, initPlayer, onPlayerInitialized} = this.props;
		const player = new YoutubePlayer();
		if (initPlayer) initPlayer(player);
		this.player = player;

		player.containerUI = this.root;
		await player.EnsureReady();
		if (!this.mounted) return;

		if (onPlayerInitialized) onPlayerInitialized(player);
		player.LoadVideo({videoID, startTime}, autoplay);
	}
}