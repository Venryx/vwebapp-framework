export type SpeakInfo = {
	text: string;
	voice?: string;
	volume?: number;
	rate?: number;
	pitch?: number;
};
export function Speak(info: SpeakInfo) {
	var speech = new SpeechSynthesisUtterance();
	speech.text = info.text;
	speech.voice = speechSynthesis.getVoices().find(a=>a.name == info.voice);
	speech.volume = info.volume || 1;
	speech.rate = info.rate || 1;
	speech.pitch = info.pitch || 1;
	
	speechSynthesis.cancel();
	speechSynthesis.speak(speech);
}

export function StopSpeech() {
	speechSynthesis.cancel();
}