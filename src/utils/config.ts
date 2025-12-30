export interface BkoiConfig {
  ACCESS_TOKEN: string | null;
  DEFAULT_STYLE: string;
}

export const bkoiConfig: BkoiConfig = {
  ACCESS_TOKEN: null,
  DEFAULT_STYLE: 'https://map.barikoi.com/styles/barikoi-light/style.json'
};
