# CSS tips

- when you don't see an element, check it's position, display, z-index, height and width

- position: absolute breaks center by margin: 0 auto

scp -r C:\Projects\demos\dist\* rkrawczyszyn@192.168.100.18:/home/rkrawczyszyn/demos/dist

local PC:

1. yarn build
2. git push
3. git pull

RPI: 4. applyPermissions.sh

chmod +x /home/rkrawczyszyn/demos/dist/applyPermissions.sh && \
dos2unix /home/rkrawczyszyn/demos/dist/applyPermissions.sh && \
/home/rkrawczyszyn/demos/dist/applyPermissions.sh

4. install crontab
   crontab /home/rkrawczyszyn/demos/crontabConfig.txt
