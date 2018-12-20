#!/bin/bash
ionic cordova build android -- --buildFlag="-UseModernBuildSystem=0"
ionic cordova prepare android -- --buildFlag="-UseModernBuildSystem=0"
code-push release konleng-android ./platforms/android/app/src/main/assets/www/ 0.0.1 --description "V4" -d "Production"
