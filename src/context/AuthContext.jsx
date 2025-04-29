import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../const";

/**
 * Authentication context to manage user state and authentication functions.
 */
const AuthContext = createContext();

/**
 * AuthProvider component to provide authentication context to the application.
 *
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Child components to wrap with the provider.
 * @returns {JSX.Element} The AuthContext provider.
 */
const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [sessionType, setSessionType] = useState(null);

	/**
	 * Fetches the user's profile from the backend and updates the user state.
	 */
	useEffect(() => {
		const fetchProfile = async () => {
			const token = localStorage.getItem("token");
			const user_id = String(localStorage.getItem("user_id"));
			const session_type = String(sessionStorage.getItem("session_type"));
			try {
				const response = await axios.get(`${BACKEND_URL}/users/profile/${user_id}`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				const data = response.data;
				data.id = user_id;
				setUser(data);
				setSessionType(session_type);
			} catch (error) {
				setUser(null);
				console.error("Error fetching profile:", error);
			}
		};

		fetchProfile();
	}, []);

	/**
	 * Redirects the user to the OAuth login page for the specified provider.
	 *
	 * @param {string} provider - The OAuth provider (e.g., "google", "github" etc.).
	 */
	const login = (provider) => {
		window.location.href = `${BACKEND_URL}/api/v1/auth/${provider}/login`;
	};

	/**
	 * Logs the user out by clearing the token and resetting the user state.
	 */
	const logout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user_id");
		sessionStorage.removeItem("session_type");
		setUser(null);
		setSessionType(null);
	};

	return <AuthContext.Provider value={{ user, setUser, login, logout, sessionType }}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
