<script setup>
import { onMounted } from "vue";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { Keyboard } from "@capacitor/keyboard";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";

async function configureStatusBar() {
  if (Capacitor.isNativePlatform()) {
    try {
      if (Capacitor.getPlatform() === "android") {
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: "#ffffff" });
      } else if (Capacitor.getPlatform() === "ios") {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
      }
      console.log("✅ StatusBar configured successfully");
    } catch (error) {
      console.error("❌ StatusBar configuration failed: ", error);
    }
  }
}

// Configure Keyboard for iOS (enables accessory bar with Done button and web scrolling)
async function configureKeyboard() {
  if (Capacitor.isNativePlatform()) {
    try {
      await Keyboard.setAccessoryBarVisible({ isVisible: true });
      await Keyboard.setScroll({ isDisabled: false });
      console.log("✅ Keyboard configured successfully");
    } catch (error) {
      console.warn("⚠️ Keyboard configuration note: ", error);
    }
  }
}

onMounted(async () => {
  await configureStatusBar();
  await configureKeyboard();
  await SplashScreen.hide();

  // Tap-to-dismiss keyboard on iOS / mobile when touching outside input fields
  if (typeof window !== "undefined") {
    window.addEventListener(
      "touchstart",
      (e) => {
        const active = document.activeElement;
        if (
          active &&
          (active.tagName === "INPUT" ||
            active.tagName === "TEXTAREA" ||
            active.isContentEditable)
        ) {
          const target = e.target;
          if (
            !active.contains(target) &&
            !target.closest("input, textarea, [contenteditable], button, a, label, select")
          ) {
            active.blur();
            if (Capacitor.isNativePlatform()) {
              Keyboard.hide().catch(() => {});
            }
          }
        }
      },
      { passive: true }
    );
  }

  CapacitorApp.addListener("appStateChange", ({ isActive }) => {
    if (isActive) {
      configureStatusBar();
      configureKeyboard();
    }
  });
});
</script>

<template>
  <router-view />
</template>
