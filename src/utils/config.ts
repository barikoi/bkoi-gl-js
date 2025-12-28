export interface BkoiConfig {
  ACCESS_TOKEN: string | null;
  DEFAULT_STYLE: string;
}

// Load environment variables
require('dotenv').config();

export const bkoiConfig: BkoiConfig = {
  ACCESS_TOKEN: process.env.BKOI_ACCESS_TOKEN || process.env.TEST_BARIKOI_API_KEY || null,
  DEFAULT_STYLE: 'https://map.barikoi.com/styles/barikoi-light/style.json'
};
