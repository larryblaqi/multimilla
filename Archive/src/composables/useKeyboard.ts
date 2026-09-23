import { onMounted, onUnmounted } from 'vue';
import { Keyboard } from '@capacitor/keyboard';

export function useKeyboard() {
    const setupKeyboardListeners = () => {
        // Show keyboard only when input is focused
        const showKeyboardHandler = (event: Event) => {
            const target = event.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                Keyboard.show();
            }
        };

        // Hide keyboard when input loses focus
        const hideKeyboardHandler = (event: Event) => {
            const target = event.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                Keyboard.hide();
            }
        };

        // Add event listeners
        document.addEventListener('focusin', showKeyboardHandler);
        document.addEventListener('focusout', hideKeyboardHandler);

        // Cleanup function
        return () => {
            document.removeEventListener('focusin', showKeyboardHandler);
            document.removeEventListener('focusout', hideKeyboardHandler);
        };
    };

    return {
        setupKeyboardListeners
    };
}