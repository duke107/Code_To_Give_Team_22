import { useState } from 'react';
import './voiceStyles.css';

const VoiceControl = () => {
    const [voiceCommand, setVoiceCommand] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [supportedLanguages] = useState([
      { name: 'Hindi', code: 'hi-IN' },
      { name: 'English', code: 'en-IN' },
      { name: 'Tamil', code: 'ta-IN' }
    ]);
    const [selectedLanguage, setSelectedLanguage] = useState('hi-IN');
  
    const handleVoiceCommand = (command) => {
      const lowerCmd = command.toLowerCase();
      
      // Hindi + English commands
      if (lowerCmd.includes("दान") || lowerCmd.includes("donate")) {
        window.location.href = "/donate";
      } 
      else if (lowerCmd.includes("घटना") || lowerCmd.includes("event")) {
        window.location.href = "/events";
      }
      else if (lowerCmd.includes("स्वयंसेवक") || lowerCmd.includes("volunteer")) {
        window.location.href = "/volunteer";
      }
      else {
        alert(`Command not recognized. Try saying "Donate" or "Events".`);
      }
    };
  
    const startListening = () => {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = selectedLanguage;
      
      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setVoiceCommand(transcript);
        handleVoiceCommand(transcript);
      };
  
      recognition.onerror = (e) => {
        console.error("Error:", e.error);
        setIsListening(false);
      };
  
      recognition.onend = () => setIsListening(false);
  
      recognition.start();
      setIsListening(true);
    };
  
    return (
      <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
        <div className="flex flex-col gap-2">
          <select 
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="p-2 border rounded"
          >
            {supportedLanguages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
  
          <button
            onClick={startListening}
            disabled={isListening}
            className={`flex items-center gap-2 p-2 rounded-md text-white 
              ${isListening ? 'bg-red-500' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isListening ? (
              '🎤 Listening...'
            ) : (
              <>
                <span>🎤</span> Speak Now ({selectedLanguage})
              </>
            )}
          </button>
  
          {voiceCommand && (
            <p className="mt-2 text-sm">
              <span className="font-semibold">You said:</span> {voiceCommand}
            </p>
          )}
        </div>
      </div>
    );
  };


export default VoiceControl;