#!/bin/bash

rm build -R
mkdir build
node r.js -o app.build.js
cd build