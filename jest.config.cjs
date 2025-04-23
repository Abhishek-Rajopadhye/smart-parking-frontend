// jest.config.js

module.exports = {
	// Specify the testing environment
	testEnvironment: "jsdom",

	// Add the setup file for @testing-library/jest-dom matchers
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

	// Configure how Jest should transform files
	transform: {
		"^.+\\.(js|jsx|ts|tsx)$": "@swc/jest", // Jest will automatically pick up .swcrc
	},
	// Ignore node_modules and other directories from transformation
	transformIgnorePatterns: ["/node_modules/", "\\.pnp\\.[^\\/]+$"],

	// Module resolution for handling CSS, assets, and potentially path aliases
	moduleNameMapper: {
		// Handle CSS imports (e.g., CSS Modules)
		"\\.(css|less|sass|scss)$": "identity-obj-proxy",

		// Handle image imports
		"\\.(gif|ttf|eot|svg|png)$": "<rootDir>/__mocks__/fileMock.js",

		// If you have path aliases configured in your vite.config.js,
		// you need to mirror them here. Example for an alias '@/':
		// '^@/(.*)$': '<rootDir>/src/$1', // Adjust '/src/' if your alias points elsewhere
	},

	// Directories to scan for test files
	roots: ["<rootDir>/src", "<rootDir>/tests"], // New configuration - adds tests/

	// File patterns Jest should consider test files (this pattern usually works fine)
	testMatch: ["**/__tests__/**/*.test.{js,jsx,ts,tsx}", "**/?(*.)+(spec|test).{js,jsx,ts,tsx}"],

	// Code coverage configuration (optional)
	// collectCoverage: true,
	// coverageDirectory: 'coverage',
	// coverageReporters: ['json', 'lcov', 'text'],
	// collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/*.d.ts'],
};
