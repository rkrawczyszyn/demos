"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const priceChecker_1 = require("./utils/priceChecker");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const logDate_1 = require("../../utils/logDate");
const coinWatchConfig_1 = require("./config/coinWatchConfig");
const COIN_PRICES_PATH = path.resolve(__dirname, '../customStocks', 'custom-stock-watch-results.json');
(() => __awaiter(void 0, void 0, void 0, function* () {
    let currentCoinPrices;
    try {
        const currentCoinJsonData = fs.readFileSync(COIN_PRICES_PATH, 'utf8');
        currentCoinPrices = JSON.parse(currentCoinJsonData);
    }
    catch (error) {
        console.log(`${(0, logDate_1.logDate)()}: Error reading coin prices:`, error);
    }
    coinWatchConfig_1.coinWatchConfig.forEach((cwc) => __awaiter(void 0, void 0, void 0, function* () {
        const coinToCheck = currentCoinPrices.find((x) => x.stockCode === cwc.coinCode);
        if (!coinToCheck) {
            return;
        }
        try {
            yield (0, priceChecker_1.checkPrice)(cwc, coinToCheck.currentPrice);
        }
        catch (error) {
            console.log(`${(0, logDate_1.logDate)()}: Error executing program:`, error);
        }
    }));
}))();
