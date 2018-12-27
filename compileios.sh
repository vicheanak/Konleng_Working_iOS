#!/bin/bash
echo "Killing xcode..."
kill $(ps aux | grep 'Xcode' | awk '{print $2}')
cordova platform remove ios
cordova platform add ios
ionic cordova platform remove ios
ionic cordova platform add ios
cd platforms/ios
pod install --verbose
cp Pods/Target\ Support\ Files/Pods-Konleng/Pods-Konleng.debug.xcconfig ./pods-debug.xcconfig
cp Pods/Target\ Support\ Files/Pods-Konleng/Pods-Konleng.release.xcconfig ./pods-release.xcconfig
cd ../../
ionic cordova build ios --prod -- --buildFlag="-UseModernBuildSystem=0"
ionic cordova run ios --prod -- --buildFlag="-UseModernBuildSystem=0"
