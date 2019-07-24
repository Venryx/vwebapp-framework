const SpeechRecognitionClass = window["SpeechRecognition"] || window["webkitSpeechRecognition"];

export const inChromeAndroid = navigator.userAgent.includes("; Android ") && navigator.userAgent.includes(" Chrome/");

export class SpeechRecognizer {
	constructor(fixAutoStopAndTranscriptBugs = true) {
		this.internalRecognizer = new SpeechRecognitionClass();
		this.internalRecognizer.continuous = true;
		this.internalRecognizer.interimResults = true;
		//this.internalRecognizer.lang = "en";

		this.internalRecognizer.addEventListener("start", this.OnStart);
		this.internalRecognizer.addEventListener("end", this.OnEnd);
		this.internalRecognizer.addEventListener("result", this.OnResult);

		if (fixAutoStopAndTranscriptBugs && inChromeAndroid) {
			this.autoRestart = true;
			this.fixTranscriptBug = true;
		}

		// actually, it looks like the "transcript bug" might actually be the correct behavior (happens on Chrome Android and regular Chrome -- just didn't notice on regular because desktop lacked auto-stop bug)
		// if this is the case, then... todo: fix final-transcript stitching to match official behavior (without needing this fixTranscriptBug flag)
		this.fixTranscriptBug = true;
	}

	internalRecognizer: any;
	recognizing = false;
	private stopping = false;
	OnStart = ()=>this.recognizing = true;
	OnEnd = ()=>{
		this.recognizing = false;

		// if this stop was unintended, and auto-restarts are allowed, restart recognizing
		if (!this.stopping && this.autoRestart) {
			this.StartRecognizing(false);
			// rather than wait for event, just say we're already recognizing again (prevents issue of an external on-end listener getting confused by "recognizing:false" when a split-second later it's started again)
			this.recognizing = true;
		}

		this.stopping = false;
		this.onEndListeners.forEach(a=>a());
	}
	onEndListeners = [];
	OnResult = event=>{
		this.transcript_unfinalizedPortion = "";
		for (const result of event.results) {
			if (result.isFinal) {
				if (this.fixTranscriptBug) {
					this.transcript_finalizedPortion = result[0].transcript;
				} else {
					this.transcript_finalizedPortion += result[0].transcript;
				}
			} else {
				this.transcript_unfinalizedPortion += result[0].transcript;
			}
		}
		this.transcript_finalizedPortion = this.transcript_finalizedPortion.replace(/\S/, m=>m.toUpperCase());

		this.transcriptChangeListeners.forEach(a=>a());
	}
	transcriptChangeListeners = [];

	// way to work around the Chrome Android bug of speech-recognition auto-stopping after a few seconds of silence
	autoRestart = false;
	// way to work around the Chrome Android bug of all the "result" objects containing the whole transcript up to its point
	fixTranscriptBug = false;

	transcript_finalizedPortion = "";
	transcript_unfinalizedPortion = "";
	GetTranscript_All() { return this.transcript_finalizedPortion + this.transcript_unfinalizedPortion; }
	ClearTranscript() {
		this.transcript_finalizedPortion = "";
		this.transcript_unfinalizedPortion = "";
	}

	StartRecognizing(clearTranscript = true) {
		if (clearTranscript) this.ClearTranscript();

		this.internalRecognizer.start();
	}
	async StopRecognizing() {
		// todo: make so this insta-resolves if recording never started in the first place (eg. when on non-https domain)
		return new Promise((resolve, reject)=>{
			this.stopping = true;
			const onEndListener = ()=>{
				resolve();
				this.onEndListeners.Remove(onEndListener);
			};
			this.onEndListeners.push(onEndListener);
			this.internalRecognizer.stop();
		});
	}
}