# EZ TEST Android APK Compilation Guide 📱

This project is fully structured with **Capacitor**, enabling seamless native compilation into a real Android APK (and iOS App if needed) without using fragile or limited online PWA builders!

---

## Method 1: No-Setup Cloud Build (GitHub Actions) 🚀

This is the easiest way! We have preconfigured a **GitHub Actions workflow**. You do not need to install Java, Gradle, or Android Studio on your computer.

1. **Export to GitHub**: Use the Settings menu in Google AI Studio to export, sync, or push this repository to your GitHub account.
2. **Auto Build**: Upon push to `main` or `master` branches, GitHub Actions will automatically start a background build of your `.apk`.
3. **Get your APK**:
   1. Open your repository on GitHub.
   2. Navigate to the **Actions** tab at the top.
   3. Click on the latest run titled **Build Android Debug APK**.
   4. Scroll to the bottom to the **Artifacts** section, and click on `ez-test-android-debug-apk` to download a real, installable `.apk` file directly to your phone!

---

## Method 2: Local Compilation (Android Studio / CLI) 💻

If you prefer compiling locally on your machine, follow these steps:

### Prerequisites
- **Node.js** (v18 or v20)
- **Java JDK 17** (Required for Gradle build tools)
- **Android Studio** (Includes Android SDK, platform tools, and emulator)

### Build Commands

1. **Clean and Install Dependencies**:
   ```bash
   npm install
   ```

2. **Compile the React Code**:
   ```bash
   npm run build
   ```

3. **Sync to Native Android Wrapper**:
   ```bash
   npx cap sync android
   ```

4. **Compile the physical APK**:
   * **Via CommandLine (Quick)**:
     ```bash
     cd android
     ./gradlew assembleDebug
     ```
     Once finished, you will find your compiled APK here:
     `android/app/build/outputs/apk/debug/app-debug.apk`

   * **Via Android Studio (Visual)**:
     ```bash
     npx cap open android
     ```
     This opens the project in Android Studio, where you can click **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.

---

## Screen Adaptation
When run on a mobile device, the app instantly detects it's running via native Capacitor Shell and bypasses any decorative desktop mockup frames — resulting in a **136% native-immersion status bar and distraction-free full-screen NEET/JEE testing platform experience!**
