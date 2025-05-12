import { Button, Container, Typography, Box, Paper, SvgIcon } from "@mui/material";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import GoogleIcon from "../assets/google-color-icon.svg";
/**
 * Login page component for BookMy Parking.
 *
 * Provides options for users to log in using Google.
 * @component
 * @returns {JSX.Element} The Login page component.
 */
const Login = () => {
	const { login } = useContext(AuthContext);

	const handleLogin = (type) => {
		sessionStorage.setItem("sessionType", type);
		login("google");
	};

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
						Welcome to BookMy Parking
					</Typography>
					<Typography variant="body1" color="text.secondary">
						Please log in to continue
					</Typography>
				</Box>
				<Button
					variant="contained"
					color="primary"
					fullWidth
					onClick={() => handleLogin("User")}
					sx={{
						marginBottom: 2,
						padding: 1.5,
						fontSize: "1rem",
						textTransform: "none",
					}}
				>
					<SvgIcon sx={{ mr: 2 }}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 326667 333333"
							shape-rendering="geometricPrecision"
							text-rendering="geometricPrecision"
							image-rendering="optimizeQuality"
							fill-rule="evenodd"
							clip-rule="evenodd"
						>
							<path
								d="M326667 170370c0-13704-1112-23704-3518-34074H166667v61851h91851c-1851 15371-11851 38519-34074 54074l-311 2071 49476 38329 3428 342c31481-29074 49630-71852 49630-122593m0 0z"
								fill="#4285f4"
							/>
							<path
								d="M166667 333333c44999 0 82776-14815 110370-40370l-52593-40742c-14074 9815-32963 16667-57777 16667-44074 0-81481-29073-94816-69258l-1954 166-51447 39815-673 1870c27407 54444 83704 91852 148890 91852z"
								fill="#34a853"
							/>
							<path
								d="M71851 199630c-3518-10370-5555-21482-5555-32963 0-11482 2036-22593 5370-32963l-93-2209-52091-40455-1704 811C6482 114444 1 139814 1 166666s6482 52221 17777 74814l54074-41851m0 0z"
								fill="#fbbc04"
							/>
							<path
								d="M166667 64444c31296 0 52406 13519 64444 24816l47037-45926C249260 16482 211666 1 166667 1 101481 1 45185 37408 17777 91852l53889 41853c13520-40185 50927-69260 95001-69260m0 0z"
								fill="#ea4335"
							/>
						</svg>
					</SvgIcon>
					Login as User
				</Button>
				<Button
					variant="contained"
					color="secondary"
					fullWidth
					onClick={() => handleLogin("Owner")}
					sx={{
						marginBottom: 2,
						padding: 1.5,
						fontSize: "1rem",
						textTransform: "none",
					}}
				>
					<SvgIcon sx={{ mr: 2 }}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 326667 333333"
							shape-rendering="geometricPrecision"
							text-rendering="geometricPrecision"
							image-rendering="optimizeQuality"
							fill-rule="evenodd"
							clip-rule="evenodd"
						>
							<path
								d="M326667 170370c0-13704-1112-23704-3518-34074H166667v61851h91851c-1851 15371-11851 38519-34074 54074l-311 2071 49476 38329 3428 342c31481-29074 49630-71852 49630-122593m0 0z"
								fill="#4285f4"
							/>
							<path
								d="M166667 333333c44999 0 82776-14815 110370-40370l-52593-40742c-14074 9815-32963 16667-57777 16667-44074 0-81481-29073-94816-69258l-1954 166-51447 39815-673 1870c27407 54444 83704 91852 148890 91852z"
								fill="#34a853"
							/>
							<path
								d="M71851 199630c-3518-10370-5555-21482-5555-32963 0-11482 2036-22593 5370-32963l-93-2209-52091-40455-1704 811C6482 114444 1 139814 1 166666s6482 52221 17777 74814l54074-41851m0 0z"
								fill="#fbbc04"
							/>
							<path
								d="M166667 64444c31296 0 52406 13519 64444 24816l47037-45926C249260 16482 211666 1 166667 1 101481 1 45185 37408 17777 91852l53889 41853c13520-40185 50927-69260 95001-69260m0 0z"
								fill="#ea4335"
							/>
						</svg>
					</SvgIcon>
					Login as Owner
				</Button>
			</Paper>
		</Container>
	);
};

export { Login };
