const SpeechRecognitionClass = window["SpeechRecognition"] || window["webkitSpeechRecognition"];

// Note that if the user checks "Desktop site", the user-agent will no longer contain "Android", breaking this detection.
export const inChromeAndroid = navigator.userAgent.includes("; Android ") && navigator.userAgent.includes(" Chrome/");

export class SpeechRecognizer {
	constructor(fixTranscriptBugIfPresent = true) {
	//constructor() {
		this.internalRecognizer = new SpeechRecognitionClass();
		this.internalRecognizer.continuous = true;
		this.internalRecognizer.interimResults = true;
		//this.internalRecognizer.lang = "en";

		this.internalRecognizer.addEventListener("start", this.OnStart);
		this.internalRecognizer.addEventListener("end", this.OnEnd);
		this.internalRecognizer.addEventListener("result", this.OnResult);

		if (fixTranscriptBugIfPresent && inChromeAndroid) this.fixTranscriptBug = true;

		// actually, it looks like the "transcript bug" might actually be the correct behavior (happens on Chrome Android and regular Chrome -- just didn't notice on regular because desktop lacked auto-stop bug)
		// if this is the case, then... todo: fix final-transcript stitching to match official behavior (without needing this fixTranscriptBug flag)
		// update: nvm, seems is not intended behavior
		//this.fixTranscriptBug = true;
	}

	internalRecognizer: any;
	recognizing = false;
	private userStopInProgress = false;
	OnStart = ()=>this.recognizing = true;
	OnEnd = ()=>{
		this.recognizing = false;

		// if this stop was unintended, and auto-restarts are allowed, restart recognizing
		if (!this.userStopInProgress && this.autoRestart) {
			this.StartRecognizing();
			// rather than wait for event, just say we're already recognizing again (prevents issue of an external on-end listener getting confused by "recognizing:false" when a split-second later it's started again)
			this.recognizing = true;
		}

		this.userStopInProgress = false;
		this.onEndListeners.forEach(a=>a());
	}
	onEndListeners = [];
	OnResult = event=>{
		/*this.transcript_finalizedPortion = "";
		this.transcript_unfinalizedPortion = "";*/
		/*this.ClearTranscript();
		for (const result of event.results) {
			if (result.isFinal) {
				/*if (this.fixTranscriptBug) {
					this.transcript_finalizedPortion = result[0].transcript;
				} else {
					this.transcript_finalizedPortion += result[0].transcript;
				}*#/
				this.transcript_finalizedPortion += result[0].transcript;
			} else {
				this.transcript_unfinalizedPortion += result[0].transcript;
			}
		}
		this.transcript_finalizedPortion = this.transcript_finalizedPortion.replace(/\S/, m=>m.toUpperCase());*/

		this.transcriptSessions.Last().segments = Array.from(event.results as any[]).map(rawSegment=>{
			return new TranscriptSegment({text: rawSegment[0].transcript, isFinal: rawSegment.isFinal});
		});

		this.transcriptChangeListeners.forEach(a=>a());
	}
	transcriptChangeListeners = [];

	// Chrome Desktop stops recognizing after ~30s of inactivity; Chrome Android stops after ~5s! So by default, auto-restart.
	autoRestart = true;
	// way to work around the Chrome Android bug of each entry in "event.results" containing the whole transcript up to its point
	fixTranscriptBug = false;

	transcriptSessions: TranscriptSession[] = [];
	GetTranscript(finalizedSegments = true, unfinalizedSegments = true) {
		if (this.fixTranscriptBug) {
			return this.transcriptSessions.map(session=>{
				let result = "";
				if (finalizedSegments) result += session.segments.filter(a=>a.isFinal).map(a=>a.text).LastOrX(null, "");
				if (unfinalizedSegments) result += session.segments.filter(a=>!a.isFinal).map(a=>a.text).LastOrX(null, "");
				return result;
			}).join(" ");
		}

		return this.transcriptSessions.map(session=>{
			return session.segments.filter(a=>(a.isFinal && finalizedSegments) || (!a.isFinal && unfinalizedSegments)).map(segment=>segment.text).join(" ");
		}).join(" ");
	}
	// to be called when owner has already retrieved the existing text/transcript, and wants to prepare for another recording
	ClearTranscript() {
		this.transcriptSessions.Clear();
	}

	StartRecognizing() {
		//if (clearTranscript) this.ClearTranscript();

		this.transcriptSessions.push(new TranscriptSession());
		this.internalRecognizer.start();
	}
	async StopRecognizing() {
		// todo: make so this insta-resolves if recording never started in the first place (eg. when on non-https domain)
		return new Promise((resolve, reject)=>{
			this.userStopInProgress = true;
			const onEndListener = ()=>{
				resolve();
				this.onEndListeners.Remove(onEndListener);
			};
			this.onEndListeners.push(onEndListener);
			this.internalRecognizer.stop();
		});
	}
}

export class TranscriptSession {
	segments: TranscriptSegment[] = [];
}
export class TranscriptSegment {
	constructor(initialData: Partial<TranscriptSegment>) {
		this.Extend(initialData);
	}
	text: string;
	isFinal: boolean;
}