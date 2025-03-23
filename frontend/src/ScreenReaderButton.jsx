import React, { useState, useEffect, useRef } from 'react';

const ScreenReader = () => {
  const [isEnabled, setIsEnabled] = useState(false); // Screen reader enabled by default
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false);
  const enableButtonRef = useRef(null);

  // Initialize voices when the component mounts
  useEffect(() => {
    const initVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      // Try to find a male voice
      const voice =
        voices.find((voice) => voice.name === 'Google UK English Male') ||
        voices.find(
          (voice) => voice.name.toLowerCase().includes('male')
        ) ||
        voices.find((v) => v.lang === 'en-GB') ||
        voices[0];

      if (voice) {
        setSelectedVoice(voice);
        console.log('Selected voice:', voice.name);
      }
    };

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = initVoices;
    }
    initVoices();
  }, []);

  const readAloud = (text) => {
    window.speechSynthesis.cancel();
    if (!text || !selectedVoice) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.lang = 'en-GB';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (isEnabled) {
      readAloud('Press Enter if you want to enable screen reader');
    }

    if (!isEnabled) return;

    if (enableButtonRef.current) {
      enableButtonRef.current.focus();
      const buttonText =
        enableButtonRef.current.getAttribute('aria-label') ||
        enableButtonRef.current.textContent;
      readAloud(buttonText);
    }

    const handleMouseOver = (event) => {
      if (event.target.closest('.screen-reader-controls')) return;
      if (isKeyboardNavigation) return;
      const text =
        event.target.getAttribute('aria-label') ||
        (event.target.tagName === 'IMG' && event.target.getAttribute('alt')) ||
        event.target.textContent?.trim();
      if (text) {
        readAloud(text);
      }
    };

    const handleFocus = (event) => {
      if (event.target.closest('.screen-reader-controls')) return;
      if (!isKeyboardNavigation) return;

      let text = '';

      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        const label = document.querySelector(`label[for="${event.target.id}"]`);
        if (label) {
          text = label.textContent.trim();
        } else if (event.target.getAttribute('aria-label')) {
          text = event.target.getAttribute('aria-label');
        } else if (event.target.placeholder) {
          text = `Field: ${event.target.placeholder}`;
        }
      } else if (event.target.tagName === 'SELECT') {
        const label = document.querySelector(`label[for="${event.target.id}"]`);
        if (label) {
          text = label.textContent.trim();
        } else if (event.target.getAttribute('aria-label')) {
          text = event.target.getAttribute('aria-label');
        }
        const optionsCount = event.target.options.length;
        const selectedOptionText = event.target.options[event.target.selectedIndex]?.text;
        text += selectedOptionText ? `, selected option: ${selectedOptionText}` : '';
        text += `, with ${optionsCount} options.`;
      } else {
        text =
          event.target.getAttribute('aria-label') ||
          (event.target.tagName === 'IMG' && event.target.getAttribute('alt')) ||
          event.target.textContent?.trim();
      }

      if (text) {
        readAloud(text);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Tab') {
        setIsKeyboardNavigation(true);
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        const focusableElements = Array.from(
          document.querySelectorAll('button, input, a, select, textarea')
        );
        let currentIndex = focusableElements.indexOf(document.activeElement);
        if (event.key === 'ArrowLeft') {
          currentIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
        } else if (event.key === 'ArrowRight') {
          currentIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
        }
        focusableElements[currentIndex].focus();
        readAloud(focusableElements[currentIndex].textContent || 'Focusable element');
      }
    };

    const handleMouseMove = () => {
      if (isKeyboardNavigation) {
        setIsKeyboardNavigation(false);
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('focus', handleFocus, true);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('focus', handleFocus, true);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleMouseMove);
      window.speechSynthesis.cancel();
    };
  }, [isEnabled, selectedVoice, isKeyboardNavigation]);

  return (
    <>
      <div className="screen-reader-controls flex items-center gap-2">
        <button
          ref={enableButtonRef}
          onClick={() => {
            if (isEnabled) {
              window.speechSynthesis.cancel();
            }
            setIsEnabled(!isEnabled);
          }}
          aria-label={isEnabled ? 'Disable screen reader' : 'Enable screen reader'}
          className="fixed bottom-5 right-5 bg-red-600 text-white px-4 py-2 rounded shadow transition transform hover:bg-red-700 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
        >
          {isEnabled ? '🔇 Disable Screen Reader' : '🔊 Enable Screen Reader'}
        </button>
      </div>

      {/* Global styles for the Google Translate dropdown using Tailwind-like utilities */}
      <style jsx global>{`
        .goog-te-combo {
          padding: 0.5rem 1rem;
          background-color: #007bff;
          color: #ffffff;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          width: 100%;
          max-width: 150px;
          cursor: pointer;
          transition: background-color 0.2s ease-in-out;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }
        .goog-te-combo:hover {
          background-color: #0056b3;
        }
        .goog-te-combo:focus {
          outline: none;
          box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #007bff;
        }
        .goog-logo-link {
          display: none !important;
        }
        .goog-te-gadget {
          color: transparent !important;
          font-size: 0 !important;
        }
        @media (prefers-color-scheme: dark) {
          .goog-te-combo {
            background-color: #0056b3;
            color: #ffffff;
          }
          .goog-te-combo:hover {
            background-color: #003d82;
          }
          .goog-te-combo:focus {
            box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #0056b3;
          }
        }
        @media (forced-colors: active) {
          .goog-te-combo {
            border: 2px solid currentColor;
          }
        }
        @media (max-width: 768px) {
          .goog-te-combo {
            max-width: none;
          }
        }
      `}</style>
    </>
  );
};

export default ScreenReader;
