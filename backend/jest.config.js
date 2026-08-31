module.exports = {
  testEnvironment: "node",

  transform: {
    "^.+\\.tsx?$": ["@swc/jest"],
  },

  testMatch: ["**/__tests__/**/*.test.ts"],

  moduleFileExtensions: ["ts", "js", "json"],

  collectCoverageFrom: ["**/*.ts", "!**/node_modules/**", "!**/__tests__/**"],
};
