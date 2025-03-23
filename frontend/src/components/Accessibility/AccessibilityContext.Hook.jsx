import { useContext } from "react";
import AccessibilityContext from "./AccessibilityContext.Provider";

export const useAccessibility = () => useContext(AccessibilityContext);