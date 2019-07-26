export async function InitAudioNodes(audioContext: AudioContext) {
	await audioContext.audioWorklet.addModule(URL.createObjectURL(GeneralAudioProcessor_codeBlob));
}

// RetrieveAudioProcessor
// ==========

const GeneralAudioProcessor_code = `
	class GeneralAudioProcessor extends AudioWorkletProcessor {
		notifyIntensities = [];
		notifyIntensities_lastTimes = [];
		minNotifyInterval = 0;
		constructor() {
			super();
			this.port.onmessage = event=> {
				let message = event.data;
				if (message.type == "init") {
					this.notifyIntensities = message.notifyIntensities;
					this.minNotifyInterval = message.minNotifyInterval;
				}
			};
			//this.port.start();
		}

		lastLogTime = 0;
		FrequentLog(str) {
			if (Date.now() - this.lastLogTime > 100) {
				console.log(str);
				this.lastLogTime = Date.now();
			}
		}

		process(inputs, outputs, parameters) {
			const inputChannels = inputs[0];
			const outputChannels = outputs[0];
			outputChannels.forEach((channel, index)=>{
				for (let i = 0; i < channel.length; i++) {
					// we don't actually want to output any sound, we're just listening; so don't transfer input-data to output-data
					//channel[i] = inputChannels[index][i];

					let actualIntensity = inputChannels[index][i];
					//this.FrequentLog("Test4: " + actualIntensity);
					for (let [index, notifyIntensity] of this.notifyIntensities.entries()) {
						if (actualIntensity >= notifyIntensity) {
							let lastTime = this.notifyIntensities_lastTimes[index] || 0;
							if (Date.now() >= lastTime + this.minNotifyInterval) {
								this.port.postMessage({type: "notify-intensity", notifyIntensity, actualIntensity});
								this.notifyIntensities_lastTimes[index] = Date.now();
							}
						}
					}
				}
			});
			return true;
		}
		
	}
	registerProcessor("GeneralAudioProcessor", GeneralAudioProcessor);
`.AsMultiline(0);
var GeneralAudioProcessor_codeBlob = new Blob([GeneralAudioProcessor_code], {type: "application/javascript"});
export function CreateGeneralAudioProcessor(audioContext: AudioContext) {
	return new AudioWorkletNode(audioContext, "GeneralAudioProcessor");
}