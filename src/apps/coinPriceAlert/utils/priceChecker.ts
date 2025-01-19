import { shouldSendEmail, updateLastSentValue, getLastSentValue } from './fileManager';
import { sendEmail } from '../../../utils/emailSender';
import { CoinAlertConfig } from './types';

export const checkPrice = async (config: CoinAlertConfig, currentValue: number) => {
  if (shouldSendEmail(config, currentValue)) {
    const subject = `Price Alert: ${config.coinCode}`;
    const text = `The price of ${config.coinCode} has reached ${currentValue}.`;

    await sendEmail({ subject, text });
    updateLastSentValue(config.coinCode, currentValue);
  }
};
