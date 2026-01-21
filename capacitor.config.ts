import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'scavenger-hunt',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
      url: 'http://10.10.16.140:4200',
      cleartext: true
    }
};

export default config;
