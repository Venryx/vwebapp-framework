export declare type SpeakInfo = {
    text: string;
    voice?: string;
    volume?: number;
    rate?: number;
    pitch?: number;
};
export declare function Speak(info: SpeakInfo): void;
export declare function StopSpeech(): void;
