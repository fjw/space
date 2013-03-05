#!/bin/bash

rm build -R
mkdir build
node r.js -o app.build.js
cd build
mkdir wd
chown www-data:www-data * -R