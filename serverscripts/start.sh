cd /var/apps/space/server
NODE_ENV=production NEW_RELIC_APP_NAME=worldserver forever start worldserver.js
NODE_ENV=production NEW_RELIC_APP_NAME=resserver forever start resserver.js
NODE_ENV=production NEW_RELIC_APP_NAME=comserver forever start comserver.js

