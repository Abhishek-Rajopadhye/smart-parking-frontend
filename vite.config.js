import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		port: 5173,
	},
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: './vitest.setup.js', // If you have a setup file
		// coverage: { ... } // Optional: for coverage
	  },
});
