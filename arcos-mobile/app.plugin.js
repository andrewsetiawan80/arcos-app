const { withAndroidManifest, AndroidConfig } = require('expo/config-plugins');

module.exports = function withAndroidCleartextTraffic(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;
    
    // Find or create the application element
    if (!androidManifest.application) {
      androidManifest.application = [{}];
    }
    
    let application = androidManifest.application[0];
    if (!application) {
      androidManifest.application[0] = {};
      application = androidManifest.application[0];
    }
    
    // Ensure $ exists
    if (!application.$) {
      application.$ = {};
    }
    
    // Add usesCleartextTraffic attribute
    application.$['android:usesCleartextTraffic'] = 'true';
    
    // Also add INTERNET permission if not present
    if (!androidManifest['uses-permission']) {
      androidManifest['uses-permission'] = [];
    }
    
    const hasInternetPermission = androidManifest['uses-permission'].some(
      (perm) => perm.$?.['android:name'] === 'android.permission.INTERNET'
    );
    
    if (!hasInternetPermission) {
      androidManifest['uses-permission'].push({
        $: { 'android:name': 'android.permission.INTERNET' },
      });
    }
    
    return config;
  });
};

