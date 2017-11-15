jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.jks platforms\android\build\outputs\apk\android-release-unsigned.apk my-alias
del lifecall.apk
zipalign -v 4 platforms\android\build\outputs\apk\android-release-unsigned.apk lifecall.apk

