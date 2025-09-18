#!/bin/bash -ex
V=$(cat chrome/manifest.json | jq -Mr .version)
rm -f "pin-tab-$V.zip"
cd chrome
zip -r "../pin-tab-$V.zip" . -x '*.DS_Store' -x '*Thumbs.db'
