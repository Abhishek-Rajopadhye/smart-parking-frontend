import { ThemeProvider } from "@mui/material/styles";
import appTheme from "./style/AppTheme";
import { AuthProvider } from "./context/AuthContext";
import { MapProvider } from "./context/MapContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Login } from "./pages/Login";
import AppLayout from "./AppLayout";

/**
 * App component for initializing the application.
 *
 * Wraps the application with providers for authentication, theming, and map context.
 *
 * @component
 * @returns {JSX.Element} The App component.
 */
const App = () => {
	return (
		<ThemeProvider theme={appTheme}>
			<MapProvider>
				<AuthProvider>
					<Router>
						<Routes>
							<Route path="/" element={<Login />} />
							<Route path="/*" element={<AppLayout />} />
						</Routes>
					</Router>
				</AuthProvider>
			</MapProvider>
		</ThemeProvider>
	);
};

export default App;
