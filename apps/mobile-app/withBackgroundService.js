const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withBackgroundService(config) {
  return withAndroidManifest(config, async config => {
    const app = config.modResults.manifest.application[0];
    if (!app.service) {
      app.service = [];
    }
    const serviceExists = app.service.some(s => s.$['android:name'] === 'com.asterinet.react.bgactions.RNBackgroundActionsTask');
    if (!serviceExists) {
      app.service.push({
        $: {
          'android:name': 'com.asterinet.react.bgactions.RNBackgroundActionsTask',
          'android:foregroundServiceType': 'location'
        }
      });
    }
    return config;
  });
};
