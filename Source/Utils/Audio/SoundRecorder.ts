declare const MediaRecorder;

export class SoundRecorder {
	audioChunks = [];
	//recorder: MediaRecorder;
	recorder: any;

	IsActive() {
		return this.recorder != null && this.recorder.state != "inactive";
	}
	IsRecording() {
		return this.recorder != null && this.recorder.state == "recording";
	}
	IsPaused() {
		return this.recorder != null && this.recorder.state == "paused";
	}

	async StartRecording() {
		if (this.recorder == null) {
			const stream = await navigator.mediaDevices.getUserMedia({audio: true});
			this.recorder = new MediaRecorder(stream);
			this.recorder.ondataavailable = e=>{
				this.audioChunks.push(e.data);
				/*if (rec.state == "inactive") {
					let blob = new Blob(this.audioChunks, {type:'audio/x-mpeg-3'});
					recordedAudio.src = URL.createObjectURL(blob);
					recordedAudio.controls=true;
					recordedAudio.autoplay=true;
					audioDownload.href = recordedAudio.src;
					audioDownload.download = 'mp3';
					audioDownload.innerHTML = 'download';
				}*/
			};
		}
		this.recorder.start();
	}
	StopRecording() {
		if (!this.IsActive()) return;
		return new Promise((resolve, reject)=>{
			const self = this;
			this.recorder.addEventListener("stop", function OnStop() { resolve(); self.recorder.removeEventListener("stop", OnStop); });
			this.recorder.addEventListener("error", function OnError(error) { reject(error); self.recorder.removeEventListener("error", OnError); });
			this.recorder.stop();
		});
	}
}