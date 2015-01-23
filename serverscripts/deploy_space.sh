./stop.sh
echo "--------------"
echo "--------------"
cd /var/apps/space
git pull
echo "--------------"
echo "--------------"
cd client
./build.sh
echo "--------------"
echo "--------------"
cd ~/scripts
./start.sh
