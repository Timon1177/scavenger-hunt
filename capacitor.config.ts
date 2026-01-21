import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'scavenger-hunt',
  webDir: 'www'
  server: {
      url: 'http://<IP-Adresse>:4200',
      cleartext: true
    }
};

export default config;
