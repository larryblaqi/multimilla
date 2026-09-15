<script setup>
import { onMounted } from "vue";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen"; // 👈 Import SplashScreen

import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";

// Configure StatusBar
async function configureStatusBar() {
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android") {
    try {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: "#ffffff" });
      console.log("✅ StatusBar configured successfully");
    } catch (error) {
      console.error("❌ StatusBar configuration failed: ", error);
    }
  }
}

onMounted(async () => {
  await configureStatusBar();
  await SplashScreen.hide();

  CapacitorApp.addListener("appStateChange", ({ isActive }) => {
    if (isActive) {
      configureStatusBar();
    }
  });
});
</script>

<template>
  <router-view />
</template>
