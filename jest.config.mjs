export default {
  testEnvironment: 'node',
  testMatch: ["**/tests/**/*.test.mjs"],

  // Babel ile transform et
  transform: {
    "^.+\\.m?[jt]s$": ["babel-jest", { presets: ["@babel/preset-env"] }],
  },

  transformIgnorePatterns: [
    // Bu satır ESM kullanan node_modules (örneğin graphql-request) için gerekli
    "/node_modules/(?!graphql-request)"
  ],

  reporters: [
    "default",
    ["jest-html-reporter", {
      pageTitle: "Test Raporu",
      outputPath: "reports/test-report.html",
      // opsiyonel ek ayarlar:
      // includeFailureMsg: true,
      // includeSuiteFailure: true,
    }]
  ],
};
