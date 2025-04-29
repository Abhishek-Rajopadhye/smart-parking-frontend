import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Container, Typography } from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { BACKEND_URL } from "../const";

/**
 * Auth page component for handling OAuth redirection and user authentication.
 *
 * Extracts the token and user ID from the URL, stores them in localStorage,
 * and redirects the user to the home page.
 * @component
 * @returns {JSX.Element} The Auth page component.
 */
const Auth = () => {
	const { user, sessionType } = useContext(AuthContext);
	const navigate = useNavigate();

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const token = params.get("token");
		const user_id = params.get("user_id");
		if (token) {
			localStorage.setItem("token", token);
			localStorage.setItem("user_id", user_id);
			axios.put(`${BACKEND_URL}/bookings/user/${user_id}`);
			if (sessionType == "User") {
				navigate("/homepage");
			} else {
				navigate("/ownerdashboard");
			}
		}
	}, [navigate, sessionType]);

	if (!user) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Container maxWidth="sm" sx={{ textAlign: "center", marginTop: "50px" }}>
			{user ? (
				<>
					<Typography variant="h4">Welcome, {user.name}!</Typography>
					<img src={user.profile_picture} alt="Profile" width="100" style={{ borderRadius: "50%" }} />
				</>
			) : (
				<Typography variant="h5">Loading user data...</Typography>
			)}
		</Container>
	);
};

export { Auth };
