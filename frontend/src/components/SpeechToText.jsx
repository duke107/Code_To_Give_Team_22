import React, { useState, useEffect, useRef } from "react";
import { HiMicrophone, HiStop } from "react-icons/hi";
import {Button} from 'flowbite-react'

const SpeechToText = ({ textAreaRef, quillRef, setText, left, bottom }) => {
    const recognitionRef = useRef(null);
    const finalTranscriptRef = useRef("");
    const toggleButtonRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [language, setLanguage] = useState("en-IN");
    const [transcript, setTranscript] = useState("");

    useEffect(() => {
        if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
            const SpeechRecognition =
                window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = language;

            recognitionRef.current.onresult = (event) => {
                let interimTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const currentResult = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscriptRef.current += currentResult + " ";
                        setTranscript(finalTranscriptRef.current);
                    } else {
                        interimTranscript += currentResult;
                    }
                }
                setTranscript(finalTranscriptRef.current + interimTranscript);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Error occurred in speech recognition:", event.error);
            };
        } else {
            alert("Web Speech API is not supported in this browser.");
        }
    }, [language]);

    const startRecording = (lang) => {
        if (recognitionRef.current) {
            if (quillRef?.current) {
                finalTranscriptRef.current = quillRef.current.getEditor().getText();
            } else if (textAreaRef?.current) {
                finalTranscriptRef.current = textAreaRef.current.value;
            }

            recognitionRef.current.lang = lang;
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };

    const stopRecording = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleToggleRecording = (e) => {
        if (isRecording) {
            stopRecording(e);
        } else {
            setShowDropdown(!showDropdown);
        }
    };

    const handleLanguageSelect = (lang) => {
        setLanguage(lang);
        startRecording(lang);
        setShowDropdown(false);
    };

    useEffect(() => {
        if (quillRef?.current) {
            const editor = quillRef.current.getEditor();
            editor.setText(transcript);
        } else if (textAreaRef?.current) {
            textAreaRef.current.value = transcript;
            setText(transcript); // Updates state if needed
        }
    }, [transcript, setText, quillRef, textAreaRef]);

    const indianLanguages = [
        { code: "en-IN", label: "English" },
        { code: "hi-IN", label: "Hindi" },
        { code: "bn-IN", label: "Bengali" },
        { code: "ta-IN", label: "Tamil" },
        { code: "te-IN", label: "Telugu" },
        { code: "kn-IN", label: "Kannada" },
        { code: "ml-IN", label: "Malayalam" },
        { code: "gu-IN", label: "Gujarati" },
        { code: "mr-IN", label: "Marathi" },
    ];

    return (
        <div className="absolute bottom-2 right-2 z-10 rounded-xl">
            <div className="relative">
            {showDropdown && !isRecording && (
                <div
                    className="static bottom-[${bottom}] left-[${left}]  w-auto p-0 z-[100] bg-white border border-gray-200 rounded shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                >
                    <ul className="divide-y divide-gray-200 max-h-[70px] w-40 overflow-y-auto">
                        {indianLanguages.map((lang) => (
                            <li key={lang.code}>
                                <button
                                    onClick={() => handleLanguageSelect(lang.code)}
                                    className="block w-full px-4 py-2 text-left hover:bg-blue-100 text-blue-700 text-sm"
                                >
                                    {lang.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

                <Button
                    type="button"
                    onClick={handleToggleRecording}
                    ref={toggleButtonRef}
                    color={isRecording ? "failure" : "info"}
                    className="relative bg-red-600 px-0 py-0 rounded-3xl text-white font-medium w-15 h-15 "
                >
                    {isRecording ? (
                        <HiStop className="mr-0 h-4 w-4" />
                    ) : (
                        <HiMicrophone className="mr-0 h-4 w-4" />
                    )}
                </Button>
            </div>
        </div>
    );
};

export default SpeechToText;
