"use strict";
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
exports.checkPrice = void 0;
const fileManager_1 = require("./fileManager");
const emailSender_1 = require("./emailSender");
const checkPrice = (config, currentValue) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, fileManager_1.shouldSendEmail)(config, currentValue)) {
        yield (0, emailSender_1.sendEmail)(config.coinCode, currentValue);
        (0, fileManager_1.updateLastSentValue)(config.coinCode, currentValue);
    }
});
exports.checkPrice = checkPrice;
