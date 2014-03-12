#!/bin/sh


#gource --highlight-dirs --max-files 10000 --date-format "%d.%m.%Y" --file-idle-time 0 --auto-skip-seconds 1 -1280x720 --file-filter "(.)*\.png|node_modules" --stop-at-end --output-ppm-stream - | ffmpeg -y -b 10000K -r 60 -f image2pipe -vcodec ppm -i - -vcodec mpeg4 gource.mp4


#gource --date-format "%d.%m.%Y" --file-idle-time 0 --auto-skip-seconds 1 -1920x1080 --stop-at-end --output-ppm-stream - | ffmpeg -y -b 10000K -r 60 -f image2pipe -vcodec ppm -i - -vcodec mpeg4 gource.mp4

#lossless:
#gource --date-format "%d.%m.%Y" --file-idle-time 0 --auto-skip-seconds 1 -1920x1080 --stop-at-end --output-ppm-stream - | ffmpeg -y -r 60 -f image2pipe -vcodec ppm -i - -vcodec libx264 -preset ultrafast -qp 0 output.avi


#gource --date-format "%d.%m.%Y" --file-idle-time 0 --auto-skip-seconds 1 -1920x1080 --stop-at-end --output-ppm-stream - | ffmpeg -an -y -r 60 -f image2pipe -vcodec ppm -i - -vcodec libx264 -preset ultrafast -qp 0 output.avi


gource --date-format "%d.%m.%Y" --file-idle-time 0 --auto-skip-seconds 1 -1920x1080 --stop-at-end --output-ppm-stream - | ffmpeg -an -y -r 60 -f image2pipe -vcodec ppm -i - -vcodec libx264 -preset veryslow -crf 16 gource.avi

