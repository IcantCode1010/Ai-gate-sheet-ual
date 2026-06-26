import { useState, useRef, useCallback } from "react";

export function useVoice(onFinalTranscript) {
  const [listening, setListening] = useState(false);
  const [supported] = useState(
    () => !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
  const recRef = useRef(null);
  const listeningRef = useRef(false);

  const stopMic = useCallback(() => {
    listeningRef.current = false;
    setListening(false);
    if (recRef.current) {
      recRef.current.stop();
      recRef.current = null;
    }
  }, []);

  const startMic = useCallback((getCurrentInput, setInput) => {
    if (!supported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    recRef.current = rec;
    listeningRef.current = true;
    setListening(true);

    let finalText = getCurrentInput();

    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalText += (finalText ? " " : "") + t.trim();
        } else {
          interim = t;
        }
      }
      setInput(finalText + (interim ? " " + interim : ""));
    };

    rec.onend = () => {
      if (listeningRef.current && finalText.trim()) {
        stopMic();
        setTimeout(() => onFinalTranscript(finalText.trim()), 600);
      } else if (listeningRef.current) {
        rec.start();
      }
    };

    rec.onerror = (e) => {
      stopMic();
      if (e.error !== "aborted") {
        onFinalTranscript(null, `Voice error: ${e.error}`);
      }
    };

    rec.start();
  }, [supported, stopMic, onFinalTranscript]);

  const toggle = useCallback((getCurrentInput, setInput) => {
    if (listening) {
      stopMic();
    } else {
      startMic(getCurrentInput, setInput);
    }
  }, [listening, stopMic, startMic]);

  return { listening, supported, toggle, stopMic };
}
