import React, { useEffect } from "react";

function TranslateButton() {
    useEffect(() => {
        const addGoogleTranslateScript = () => {
            if (!document.getElementById("google-translate-script")) {
                const script = document.createElement("script");
                script.id = "google-translate-script";
                script.type = "text/javascript";
                script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
                document.body.appendChild(script);
            }
        };

        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement(
                {
                    pageLanguage: "en",
                    layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                },
                "google_translate_element"
            );
            setTimeout(filterLanguages, 500); // Delay to allow dropdown to render
        };

        const filterLanguages = () => {
            const allowedLanguages = [
                "Assamese", "Bengali", "Gujarati", "Hindi", "Kannada", "Malayalam",
                "Marathi", "Nepali", "Odia", "Punjabi", "Sanskrit", "Sindhi", "Tamil", 
                "Telugu", "Urdu"
            ];
            const languageNodes = document.querySelectorAll(".goog-te-menu2-item span.text");

            languageNodes.forEach((node) => {
                const language = node.innerText;
                if (!allowedLanguages.includes(language)) {
                    node.parentElement.style.display = "none";
                }
            });
        };

        addGoogleTranslateScript();
    }, []);

    const handleTranslate = () => {
        const googleTranslateElement = document.getElementById("google_translate_element");
        if (googleTranslateElement) {
            googleTranslateElement.classList.toggle("hidden");
        }
    };

    return (
        <div style={{
            position: "fixed",
            top: "50%",
            right: "0",
            transform: "translateY(-50%)",
            zIndex: 1000,
            backgroundColor: "#007bff",
            padding: "10px",
            borderRadius: "5px 0 0 5px",
            color: "#fff",
            cursor: "pointer",
        }} onClick={handleTranslate}>
            Translate
            <div id="google_translate_element" className="hidden" style={{ marginTop: "5px" }}></div>
        </div>
    );
}

export default TranslateButton;
