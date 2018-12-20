#!/bin/bash
ionic cordova build android --prod --release -- -- --minSdkVersion=19
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -storepass tU/x@168rY -keystore ~/.ssh/my-release-key.keystore /Users/den/Documents/Konleng/platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk alias_name
rm Konleng.apk
zipalign -v 4 /Users/den/Documents/Konleng/platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk ./Konleng.apk
adb uninstall com.konleng.app
adb install -r Konleng.apk
adb shell monkey -p com.konleng.app -c android.intent.category.LAUNCHER 1
