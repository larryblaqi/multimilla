import { Keyboard } from '@capacitor/keyboard';
import { defineCustomElement } from 'vue';


export const initializeKeyboard = () => {
    // Hide keyboard by default
    Keyboard.hide();

    // Disable automatic keyboard show
    Keyboard.setAccessoryBarVisible({ isVisible: false });
    Keyboard.setScroll({ isDisabled: true });
};
