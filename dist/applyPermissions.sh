#!/bin/bash

chmod +x /home/rkrawczyszyn/demos/dist/fetchSlots.js && \
chmod +x /home/rkrawczyszyn/demos/dist/customStocks.js && \
chmod +x /home/rkrawczyszyn/demos/dist/gitUpdate.sh && \
chmod +x /home/rkrawczyszyn/demos/dist/refreshToken.js && \
chmod +x /home/rkrawczyszyn/demos/dist/yahoo.js && \
chmod +x /home/rkrawczyszyn/demos/dist/binanceDetect.js && \
dos2unix /home/rkrawczyszyn/demos/dist/gitUpdate.sh

cp /home/rkrawczyszyn/demos/dist/customStocksWatch.json /home/rkrawczyszyn/config
cp /home/rkrawczyszyn/demos/dist/customCoinsWatch.json /home/rkrawczyszyn/config