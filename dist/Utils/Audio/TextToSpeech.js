"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function Speak(info) {
    var speech = new SpeechSynthesisUtterance();
    speech.text = info.text;
    speech.voice = speechSynthesis.getVoices().find(function (a) { return a.name == info.voice; });
    speech.volume = info.volume || 1;
    speech.rate = info.rate || 1;
    speech.pitch = info.pitch || 1;
    speechSynthesis.cancel();
    speechSynthesis.speak(speech);
}
exports.Speak = Speak;
function StopSpeech() {
    speechSynthesis.cancel();
}
exports.StopSpeech = StopSpeech;
//# sourceMappingURL=TextToSpeech.js.map