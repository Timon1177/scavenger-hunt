import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ch.schule.schnitzeljagd',
  appName: 'Schnitzeljagd',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
      url: 'http://10.10.16.140:4200',
      cleartext: true
    }
};

export default config;
