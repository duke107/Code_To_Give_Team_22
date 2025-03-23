import React, { createContext, useState, useEffect } from "react";

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {    
    const [fontSize, setFontSize] = useState(() => {
        return parseFloat(localStorage.getItem("fontSize")) || 1; // Default: 1rem
    });
    
    const [highContrast, setHighContrast] = useState(() => {
        return JSON.parse(localStorage.getItem("highContrast")) || false;
    });
    
    useEffect(() => {
        document.documentElement.style.fontSize = `${fontSize}rem`;
        localStorage.setItem("fontSize", fontSize);
    }, [fontSize]);
    
    useEffect(() => {
        if (highContrast) {
            document.body.classList.add("high-contrast");
        } else {
            document.body.classList.remove("high-contrast");
        }
        localStorage.setItem("highContrast", JSON.stringify(highContrast));
    }, [highContrast]);

    const increaseFontSize = () => {
        if (fontSize < 2.5) setFontSize((prev) => parseFloat((prev + 0.1).toFixed(1)));
    };

    const decreaseFontSize = () => {
        if (fontSize > 0.8) setFontSize((prev) => parseFloat((prev - 0.1).toFixed(1)));
    };

    const toggleHighContrast = () => {
        setHighContrast((prev) => !prev);
    };

    return (
        <AccessibilityContext.Provider value={{ fontSize, increaseFontSize, decreaseFontSize, highContrast, toggleHighContrast }}>
            {children}
        </AccessibilityContext.Provider>
    );
};

export default AccessibilityContext;
