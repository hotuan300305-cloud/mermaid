import eyesPlugin from '@applitools/eyes-cypress';
import { registerArgosTask } from '@argos-ci/cypress/task';
import coverage from '@cypress/code-coverage/task.js';
import { defineConfig } from 'cypress';
// @ts-ignore - Missing type definitions for cypress-image-snapshot
import { addMatchImageSnapshotPlugin } from 'cypress-image-snapshot/plugin.js';
import cypressSplit from 'cypress-split';

const baseConfig = {
  projectId: 'n2sma2',
  viewportWidth: 1440,
  viewportHeight: 1024,
  e2e: {
    specPattern: 'cypress/integration/**/*.{js,ts}',
    setupNodeEvents(on: any, config: any) {
      // @ts-ignore - coverage function has no call signatures
      coverage(on, config);
      cypressSplit(on, config);
      on('before:browser:launch', (browser: any, launchOptions: any) => {
        if (browser.name === 'chrome' && browser.isHeadless) {
          launchOptions.args.push('--window-size=1440,1024', '--force-device-scale-factor=1');
        }
        return launchOptions;
      });
      // copy any needed variables from process.env to config.env
      config.env.useAppli = process.env.USE_APPLI ? true : false;
      config.env.useArgos = process.env.RUN_VISUAL_TEST === 'true';

      if (config.env.useArgos) {
        registerArgosTask(on, config, {
          // Enable upload to Argos only when it runs on CI.
          uploadToArgos: !!process.env.CI,
        });
      } else {
        addMatchImageSnapshotPlugin(on, config);
      }
      // do not forget to return the changed config object!
      return config;
    },
  },
  video: false,
};

// Only use Applitools plugin when USE_APPLI is set to 'true'
export default process.env.USE_APPLI === 'true'
  ? (eyesPlugin as any)(defineConfig(baseConfig))
  : defineConfig(baseConfig);
