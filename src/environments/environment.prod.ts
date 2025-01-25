
// environment.prod.ts
import env from './.env';

export const environment = {
   production: true,
   version: env.mifos_x.version,
   hash: env.mifos_x.hash,
   fineractPlatformTenantId: 'default',
   fineractPlatformTenantIds: 'default',
   baseApiUrls: 'https://dev.mifos.io,https://demo.mifos.io,https://qa.mifos.io,https://staging.mifos.io,https://mobile.mifos.io,https://demo.fineract.dev,http://localhost:8443,http://143.244.138.183:8443',
   baseApiUrl: 'http://143.244.138.183', // Updated to HTTP
   allowServerSwitch: env.allow_switching_backend_instance,
   apiProvider: '/fineract-provider/api',
   apiVersion: '/v1',
   serverUrl: 'http://143.244.138.183:8443/fineract-provider/api/v1', // Updated to HTTP
   oauth: {
     enabled: false,
     serverUrl: 'http://143.244.138.183:8443/fineract-provider/api', // Updated to HTTP
     appId: env.oauth.appId
   },

  warningDialog: {
    title: 'Warning',
    content: 'This system is for authorized use only. Unauthorized access will result in possible legal action. By accessing this system, you acknowledge that you are authorized to do so and that all data stored and processed here is confidential.',
    buttonText: 'Close'
  },
  defaultLanguage: 'en-US',
  supportedLanguages: 'cs-CS,de-DE,en-US,es-MX,fr-FR,it-IT,ko-KO,lt-LT,lv-LV,ne-NE,pt-PT,sw-SW',
  preloadClients: true,
  defaultCharDelimiter: ',',
  displayBackEndInfo: 'true',
  displayTenantSelector: 'true',
  waitTimeForNotifications: 60,
  waitTimeForCOBCatchUp: 30,
  session: {
    timeout: {
      idleTimeout: 300000
    }
  }
};

// Dynamically updating URLs
environment.serverUrl = `${environment.baseApiUrl}${environment.apiProvider}${environment.apiVersion}`;
environment.oauth.serverUrl = `${environment.baseApiUrl}${environment.apiProvider}`;
