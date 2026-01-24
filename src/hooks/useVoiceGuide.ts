'use client';

import { useState, useEffect } from 'react';

export function useVoiceGuide() {
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [voiceOn, setVoiceOn] = useState(false);

    const enableVoice = () => {
        if (!('speechSynthesis' in window)) return;

        const unlock = new SpeechSynthesisUtterance('Voice guidance enabled');
        unlock.volume = 0;
        window.speechSynthesis.speak(unlock);

        setVoiceEnabled(true);
        setVoiceOn(true);
    };

    const speak = (text: string) => {
        if (!voiceEnabled || !voiceOn) return;

        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.85;
        u.volume = 1;
        window.speechSynthesis.speak(u);
    };

    useEffect(() => {
        return () => window.speechSynthesis.cancel();
    }, []);

    return {
        voiceEnabled,
        voiceOn,
        setVoiceOn,
        enableVoice,
        speak,
    };
}
