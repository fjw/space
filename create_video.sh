gource --highlight-dirs --max-files 10000 --date-format "%d.%m.%Y" --file-idle-time 0 --auto-skip-seconds 1 -1280x720 --file-filter "(.)*\.png|node_modules" --stop-at-end --output-ppm-stream - | ffmpeg -y -b 10000K -r 60 -f image2pipe -vcodec ppm -i - -vcodec mpeg4 gource.mp4

