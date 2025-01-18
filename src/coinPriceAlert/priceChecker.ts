import { shouldSendEmail, updateLastSentValue, getLastSentValue } from "./fileManager";
import { sendEmail } from "./emailSender";
import { CoinAlertConfig } from "./types";

export const checkPrice = async (config: CoinAlertConfig, currentValue: number) => {
  if (shouldSendEmail(config, currentValue)) {
    await sendEmail(config.coinCode, currentValue);
    updateLastSentValue(config.coinCode, currentValue);
  }
};
