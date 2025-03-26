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
            new window.google.translate.TranslateElement({
                pageLanguage: 'en', // Default page language (e.g., English)
                includedLanguages: 'as,bn,gu,hi,kn,ml,mr,ne,or,pa,sa,sd,ta,te,ur, en', // Only these languages
                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE // Dropdown style
              }, 'google_translate_element');
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
            <div id="google_translate_element" className="hidden" style={{ marginTop: "0px" }}></div>
        </div>
    );
}

export default TranslateButton;
