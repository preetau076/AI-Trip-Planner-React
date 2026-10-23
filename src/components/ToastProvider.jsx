import { useCallback, useRef, useState } from "react";
import { ToastContext } from "../context/toastContext";

/* Uses the existing .toast / .toast.show styles from common.css */
function ToastProvider({ children }) {
    const [message, setMessage] = useState("");
    const [visible, setVisible] = useState(false);
    const timer = useRef(null);

    const showToast = useCallback((text) => {
        setMessage(text);
        setVisible(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setVisible(false), 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className={"toast" + (visible ? " show" : "")} role="status" aria-live="polite">
                {message}
            </div>
        </ToastContext.Provider>
    );
}

export default ToastProvider;
