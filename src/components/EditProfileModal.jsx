import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, TextField, Button, Box } from "@mui/material";

/**
 * EditProfileModal component for editing user profile information.
 * @component
 * @param {Object} props - Component props.
 * @param {boolean} props.open - Whether the modal is open.
 * @param {Function} props.handleClose - Function to close the modal.
 * @param {Object} props.user - The current user data.
 * @param {Function} props.handleSave - Function to save the updated profile data.
 * @returns {JSX.Element} The EditProfileModal component.
 */
const EditProfileModal = ({ open, handleClose, user, handleSave }) => {
	const [formData, setFormData] = useState({
		id: "",
		name: "",
		email: "",
		phone: "",
		profile_picture: "",
		total_earnings: 0,
	});
	/**
	 * Sets the defualt form values for the Edit Details Form
	 */
	useEffect(() => {
		if (user) {
			const user_id = String(localStorage.getItem("user_id"));
			setFormData({
				id: user_id,
				name: user.name,
				email: user.email,
				phone: user.phone,
				profile_picture: user.profile_picture,
				total_earnings: user.total_earnings,
			});
		}
	}, [user]);

	/**
	 * Handles input changes in the form
	 *
	 * @param {Object} event - The event object from the input field.
	 * @param {string} event.target.name - The name attribute of the input field.
	 * @param {string} event.target.value - The value of the input field.
	 */
	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	/**
	 * Handles the form submission event.
	 * Prevents the default form submission behavior and triggers the save action with
	 * the provided form data.
	 *
	 * @param {React.FormEvent<HTMLFormElement>} event - The form submission event.
	 */
	const handleSubmit = (event) => {
		event.preventDefault();
		handleSave(formData);
	};

	return (
		<Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
			<DialogTitle>Edit Profile</DialogTitle>
			<DialogContent>
				<Box component="form" sx={{ mt: 2 }}>
					<TextField
						margin="normal"
						fullWidth
						label="Name"
						name="name"
						value={formData.name}
						onChange={handleChange}
					/>
					<TextField
						margin="normal"
						fullWidth
						label="Email"
						name="email"
						value={formData.email}
						onChange={handleChange}
					/>
					<TextField
						margin="normal"
						fullWidth
						label="Phone"
						name="phone"
						value={formData.phone}
						onChange={handleChange}
					/>
					<TextField
						margin="normal"
						fullWidth
						label="Profile Picture URL"
						name="profile_picture"
						value={formData.profile_picture}
						onChange={handleChange}
					/>
					<Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleSubmit}>
						Save
					</Button>
				</Box>
			</DialogContent>
		</Dialog>
	);
};

export { EditProfileModal };
