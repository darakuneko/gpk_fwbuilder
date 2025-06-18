const { notarize } = require('@electron/notarize');
const dotenv = require('dotenv');

dotenv.config();

interface NotarizeContext {
  electronPlatformName: string;
  appOutDir: string;
  packager: {
    appInfo: {
      productFilename: string;
    };
  };
}

async function notarizing(context: NotarizeContext): Promise<void> {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') return;
  const appName = context.packager.appInfo.productFilename;

  await notarize({
    appBundleId: "app.darakuneko.gpk_fwbuilder",
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID!,
    appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD!,
    teamId: process.env.APPLE_TEAM_ID!,
  });
}

module.exports = notarizing;