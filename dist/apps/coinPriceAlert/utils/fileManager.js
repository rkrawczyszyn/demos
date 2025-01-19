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
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldSendEmail = exports.updateLastSentValue = exports.getLastSentValue = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const CONFIG_FILE = path.resolve(__dirname, 'watchListCoinStockCompare.json');
const ensureConfigFile = () => {
    if (!fs.existsSync(CONFIG_FILE)) {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify({}), 'utf8');
    }
};
const getLastSentValue = (coinCode) => {
    ensureConfigFile();
    const data = fs.readFileSync(CONFIG_FILE, 'utf8');
    const config = JSON.parse(data);
    return config[coinCode] || null;
};
exports.getLastSentValue = getLastSentValue;
const updateLastSentValue = (coinCode, value) => {
    ensureConfigFile();
    const data = fs.readFileSync(CONFIG_FILE, 'utf8');
    const config = JSON.parse(data);
    config[coinCode] = value;
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config), 'utf8');
};
exports.updateLastSentValue = updateLastSentValue;
const shouldSendEmail = (config, currentValue) => {
    const lastValue = (0, exports.getLastSentValue)(config.coinCode);
    const { step, direction } = config;
    if (direction === 'GoDown') {
        return lastValue === null || currentValue <= lastValue - step;
    }
    else if (direction === 'GoUp') {
        return lastValue === null || currentValue >= lastValue + step;
    }
    return false;
};
exports.shouldSendEmail = shouldSendEmail;
