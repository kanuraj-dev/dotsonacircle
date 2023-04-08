const CracoLessPlugin = require("craco-less");
const theme = require("./src/theme/antTheme");

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: theme,
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
