#!/bin/bash
adb uninstall com.konleng.app
adb install -r Konleng.apk
adb shell monkey -p com.konleng.app -c android.intent.category.LAUNCHER 1
