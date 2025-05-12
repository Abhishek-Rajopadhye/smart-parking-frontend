import { createTheme } from "@mui/material/styles";

const appTheme = createTheme({
	palette: {
		primary: {
			main: "#3f51b5", // Cool deep indigo
			light: "#757de8",
			dark: "#2c387e",
			contrastText: "#fff",
		},
		secondary: {
			main: "#546e7a", // Muted blue-grey for contrast
			light: "#819ca9",
			dark: "#29434e",
			contrastText: "#fff",
		},
		background: {
			default: "#ffffff", // Very light neutral grey
			paper: "#ffffff", // Preserved white
		},
		text: {
			primary: "#1c1c1e", // Near-black for strong contrast
			secondary: "#5f6368", // Neutral grey for supporting text
		},
		error: {
			main: "#f44336",
			light: "#e57373",
			dark: "#d32f2f",
			contrastText: "#fff",
		},
		success: {
			main: "#4caf50",
			light: "#81c784",
			dark: "#388e3c",
			contrastText: "#fff",
		},
		warning: {
			main: "#ffb300", // Strong amber
			light: "#ffe082",
			dark: "#ff8f00",
			contrastText: "#000",
		},
		info: {
			main: "#0288d1", // Clean cool blue
			light: "#4fc3f7",
			dark: "#01579b",
			contrastText: "#fff",
		},
	},
	typography: {
		fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
		h1: { fontSize: "2.25rem", fontWeight: 600 },
		h2: { fontSize: "1.75rem", fontWeight: 600 },
		h3: { fontSize: "1.5rem", fontWeight: 500 },
		h4: { fontSize: "1.25rem", fontWeight: 500 },
		h5: { fontSize: "1.125rem", fontWeight: 500 },
		h6: { fontSize: "1rem", fontWeight: 500 },
		subtitle1: { fontSize: "0.95rem", color: "#5f6368" },
		subtitle2: { fontSize: "0.85rem", fontWeight: 500, color: "#5f6368" },
		body1: { fontSize: "0.95rem", lineHeight: 1.5 },
		body2: { fontSize: "0.85rem", lineHeight: 1.5 },
		button: { textTransform: "none", fontWeight: 500 },
		caption: { fontSize: "0.75rem", color: "#999" },
		overline: { fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 500 },
	},
	shape: {
		borderRadius: 6,
	},
	components: {
		MuiAppBar: {
			styleOverrides: {
				root: {
					backgroundColor: "#fff", // Clean app bar
					color: "#1c1c1e", // Dark text
					boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
				},
			},
		},
		MuiButton: {
			defaultProps: {
				variant: "contained",
				color: "primary",
			},
			styleOverrides: {
				root: {
					padding: "8px 16px",
					textTransform: "none",
				},
			},
		},
		MuiTextField: {
			defaultProps: {
				variant: "outlined",
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
				},
			},
		},
		MuiLink: {
			defaultProps: {
				underline: "hover",
			},
		},
	},
});

export default appTheme;
