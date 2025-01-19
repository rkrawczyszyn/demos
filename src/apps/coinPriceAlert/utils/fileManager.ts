import * as fs from 'fs';
import * as path from 'path';
import { CoinAlertConfig } from './types';

const CONFIG_FILE = path.resolve(__dirname, 'watchListCoinStockCompare.json');

const ensureConfigFile = () => {
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({}), 'utf8');
  }
};

export const getLastSentValue = (coinCode: string): number | null => {
  ensureConfigFile();
  const data = fs.readFileSync(CONFIG_FILE, 'utf8');
  const config = JSON.parse(data);
  return config[coinCode] || null;
};

export const updateLastSentValue = (coinCode: string, value: number) => {
  ensureConfigFile();
  const data = fs.readFileSync(CONFIG_FILE, 'utf8');
  const config = JSON.parse(data);
  config[coinCode] = value;
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config), 'utf8');
};

export const shouldSendEmail = (config: CoinAlertConfig, currentValue: number): boolean => {
  const lastValue = getLastSentValue(config.coinCode);
  const { step, direction } = config;

  if (direction === 'GoDown') {
    return lastValue === null || currentValue <= lastValue - step;
  } else if (direction === 'GoUp') {
    return lastValue === null || currentValue >= lastValue + step;
  }

  return false;
};
