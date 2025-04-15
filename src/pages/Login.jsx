import { Button, Container, Typography, Box, Paper } from "@mui/material";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";

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
		<Container
			maxWidth="sm"
			sx={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "100vh",
				width: "100vw",
			}}
		>
			<Paper
				elevation={6}
				sx={{
					padding: 4,
					borderRadius: 3,
					textAlign: "center",
					backgroundColor: "#ffffff",
				}}
			>
				<Box sx={{ marginBottom: 3 }}>
					<Typography variant="h4" fontWeight="bold" gutterBottom>
						Welcome to Smart Parking
					</Typography>
					<Typography variant="body1" color="text.secondary">
						Please log in to continue
					</Typography>
				</Box>
				<Button
					variant="contained"
					color="primary"
					fullWidth
					onClick={() => login("google")}
					sx={{
						marginBottom: 2,
						padding: 1.5,
						fontSize: "1rem",
						textTransform: "none",
					}}
				>
					Login with Google
					<GoogleIcon sx={{ ml: 2 }} />
				</Button>
				<Button
					disabled
					variant="outlined"
					color="primary"
					fullWidth
					onClick={() => login("github")}
					sx={{
						padding: 1.5,
						fontSize: "1rem",
						textTransform: "none",
					}}
				>
					Login with GitHub
					<GitHubIcon sx={{ ml: 2 }} />
				</Button>
			</Paper>
		</Container>
	);
};

export { Login };
