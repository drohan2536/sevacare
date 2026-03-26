import { useState, useRef, useCallback, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { Capacitor } from '@capacitor/core';

let SpeechRecognitionPlugin = null;

// Dynamically import the Capacitor plugin only on native
if (Capacitor.isNativePlatform()) {
  import('@capacitor-community/speech-recognition').then((mod) => {
    SpeechRecognitionPlugin = mod.SpeechRecognition;
  });
}

export default function VoiceInput({ onResult, placeholder }) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const recognitionRef = useRef(null);
  const { speechCode, language } = useLanguage();
  const isNative = Capacitor.isNativePlatform();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
        recognitionRef.current = null;
      }
    };
  }, []);

  const startListening = useCallback(async () => {
    // ---- NATIVE (Capacitor on Android) ----
    if (isNative && SpeechRecognitionPlugin) {
      try {
        // Check and request permissions
        const permStatus = await SpeechRecognitionPlugin.checkPermissions();
        if (permStatus.speechRecognition !== 'granted') {
          const newPerm = await SpeechRecognitionPlugin.requestPermissions();
          if (newPerm.speechRecognition !== 'granted') {
            console.warn('Speech recognition permission denied');
            return;
          }
        }

        setListening(true);
        setInterim(language === 'en' ? 'Listening...' : 'सुन रहा है...');

        // Remove any previous listeners to avoid duplicates
        await SpeechRecognitionPlugin.removeAllListeners();

        // Use the promise-based approach: start() returns { matches: string[] }
        const result = await SpeechRecognitionPlugin.start({
          language: speechCode,
          maxResults: 5,
          prompt: language === 'en' ? 'Speak now...' : 'बोलें...',
          partialResults: false,
          popup: true,
        });

        if (result && result.matches && result.matches.length > 0) {
          const bestMatch = result.matches[0];
          setInterim(bestMatch);
          onResult(bestMatch);
        }
      } catch (e) {
        console.error('Native speech recognition error:', e);
      } finally {
        setListening(false);
        setInterim('');
        try { await SpeechRecognitionPlugin.stop(); } catch(e) {}
      }
      return;
    }

    // ---- WEB BROWSER ----
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert(language === 'en'
        ? 'Voice input is not supported in this browser. Please use Chrome on HTTPS or localhost.'
        : 'वॉइस इनपुट इस ब्राउज़र में समर्थित नहीं है। कृपया Chrome (HTTPS) का उपयोग करें।');
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRec();
    recognitionRef.current = recognition;

    recognition.lang = speechCode;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setInterim('');
    };

    recognition.onresult = (event) => {
      let interimText = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }

      if (interimText) setInterim(interimText);
      if (finalText) {
        setInterim('');
        onResult(finalText);
      }
    };

    recognition.onend = () => {
      setListening(false);
      setInterim('');
      recognitionRef.current = null;
    };
    recognition.onerror = (e) => {
      console.error('Web speech recognition error:', e.error);
      setListening(false);
      setInterim('');
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch(e) {
      console.error('Failed to start speech recognition:', e);
      setListening(false);
    }
  }, [speechCode, onResult, isNative, language]);

  const stopListening = useCallback(() => {
    if (isNative && SpeechRecognitionPlugin) {
      SpeechRecognitionPlugin.stop().catch(() => {});
      setListening(false);
      setInterim('');
    } else if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, [isNative]);

  // On web, check if the API is available (requires HTTPS or localhost)
  const hasSpeechSupport = isNative || ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
  if (!hasSpeechSupport) return null;

  return (
    <div className="voice-input-wrapper">
      <button
        type="button"
        className={`voice-input-btn ${listening ? 'listening' : ''}`}
        onClick={listening ? stopListening : startListening}
        aria-label={listening ? 'Stop voice input' : 'Start voice input'}
      >
        {listening ? '⏹️' : '🎤'}
      </button>
      {listening && (
        <div className="voice-input-indicator">
          <span className="voice-pulse"></span>
          <span className="voice-input-text">
            {interim || placeholder || (language === 'en' ? 'Listening...' : 'सुन रहा है...')}
          </span>
        </div>
      )}
    </div>
  );
}
