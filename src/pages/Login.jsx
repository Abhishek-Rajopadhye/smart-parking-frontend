import { Button, Container, Typography } from "@mui/material";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Login page component for Smart Parking.
 *
 * Provides options for users to log in using Google or GitHub.
 * @component
 * @returns {JSX.Element} The Login page component.
 */
const Login = () => {
	const { login } = useContext(AuthContext);

	return (
		<Container maxWidth="sm" sx={{ textAlign: "center", marginTop: "50px", justifyContent: "center" }}>
			<Typography variant="h4" gutterBottom>
				Login to Smart Parking
			</Typography>
			<Button variant="contained" color="primary" onClick={() => login("google")} sx={{ margin: "10px" }}>
				Login with Google
			</Button>
		</Container>
	);
};

export { Login };
