import {g} from "../../PrivateExports";

const compsObservingVoices = [];
export function ObserveVoices(target: Function) {
	const oldCompWillMount = target.prototype.ComponentWillMount;
	target.prototype.ComponentWillMount = function() {
		compsObservingVoices.push(this);
		oldCompWillMount.apply(this, arguments);
	};
	const oldCompWillUnmount = target.prototype.ComponentWillUnmount;
	target.prototype.ComponentWillUnmount = function() {
		compsObservingVoices.Remove(this);
		oldCompWillUnmount.apply(this, arguments);
	};
}

if (g.speechSynthesis) {
	speechSynthesis.onvoiceschanged = ()=>{
		for (const comp of compsObservingVoices) {
			comp.Update();
		}
	};
}

export function GetVoices() {
	if (g.speechSynthesis == null) return [];
	const result = speechSynthesis.getVoices();
	if (result.length == 0) {
		result.push({name: "[no voices found]"} as any);
	}
	return result;
}

export type SpeakInfo = {
	text: string;
	voice?: string;
	volume?: number;
	rate?: number;
	pitch?: number;
};
export class TextSpeaker {
	speaking = false;
	Speak(info: SpeakInfo, stopOtherSpeech = true) {
		return new Promise((resolve, reject)=>{
			if (g.speechSynthesis == null) return reject(new Error("Speech-synthesis not supported."));
			const voice = GetVoices().find(a=>a.name == info.voice);
			//Assert(voice != null, `Could not find voice named "${info.voice}".`);

			if (stopOtherSpeech) {
				StopAllSpeech();
			}

			var speech = new SpeechSynthesisUtterance();
			speech.text = info.text;
			speech.voice = voice;
			speech.volume = info.volume || 1; // for me, this can range from 0% to 100%
			speech.rate = info.rate || 1; // for me, this can range from 10% to 1000%
			speech.pitch = info.pitch || 1; // for me, this can range from ~1% to 200%

			speech.onend = ()=>{
				this.speaking = false;
				resolve();
			};
			speech.onerror = ()=>{
				this.speaking = false;
				reject();
			};

			speechSynthesis.speak(speech);
			this.speaking = true;
		});
	}
	Stop() {
		// unfortunately, if we want to stop an uncompleted speech-entry, we have to clear the entire speech-queue
		if (this.speaking) {
			StopAllSpeech();
		}
	}
}

export function StopAllSpeech() {
	if (g.speechSynthesis == null) return;
	speechSynthesis.cancel();
}