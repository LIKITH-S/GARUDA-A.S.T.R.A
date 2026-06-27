const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withShortCxxPath(config) {
  return withAppBuildGradle(config, async config => {
    if (!config.modResults.contents.includes('buildStagingDirectory')) {
      config.modResults.contents = config.modResults.contents.replace(
        /android\s*\{/,
        `android {
    externalNativeBuild {
        cmake {
            buildStagingDirectory "C:/tmp/cxx/garuda"
        }
    }`
      );
    }
    return config;
  });
};
