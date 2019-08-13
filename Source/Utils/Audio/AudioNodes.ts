export async function InitAudioNodes(audioContext: AudioContext) {
	await audioContext.audioWorklet.addModule(URL.createObjectURL(GeneralAudioProcessor_codeBlob));
}

// RetrieveAudioProcessor
// ==========

const GeneralAudioProcessor_code = `
	class GeneralAudioProcessor extends AudioWorkletProcessor {
		constructor() {
			super();
			this.port.onmessage = event=> {
				let message = event.data;
				if (message.type == "init") {
					this.notifyIntensities = message.notifyIntensities;
					this.minNotifyInterval = message.minNotifyInterval;
					this.logIntensities = message.logIntensities;
				}
			};
			//this.port.start();

			// must initialize in constructor, to work in electron
			this.notifyIntensities = [];
			this.notifyIntensities_lastTimes = [];
			this.minNotifyInterval = 0;
			this.lastLogTime = 0;
		}
		
		/*notifyIntensities = [];
		notifyIntensities_lastTimes = [];
		minNotifyInterval = 0;
		logIntensities = false;

		lastLogTime = 0;*/
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
					if (this.logIntensities) {
						this.FrequentLog("Actual intensity: " + actualIntensity);
					}
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