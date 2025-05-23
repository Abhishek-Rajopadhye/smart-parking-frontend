import React, { useContext, useEffect, useState } from "react";
import {
	Box,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Button,
	Paper,
	Collapse,
	Container,
	TablePagination,
} from "@mui/material";
import axios from "axios";
import { BACKEND_URL } from "../const";
import { AuthContext } from "../context/AuthContext";

/**
 * Validation page for displaying and managing document validation requests.
 *
 * Displays a list of objects in a tabular format with columns for Identity Proof, Ownership Proof Document, NOC, and Actions.
 * Provides Accept and Deny actions for each row.
 *
 * @component
 * @returns {JSX.Element} The Validation page component.
 */
const Validation = () => {
	const { user } = useContext(AuthContext);
	const [requests, setRequests] = useState([]);
	const [collapseToggle, setCollapseToggle] = useState(null);
	const [page, setPage] = useState(0); // Current page
	const [rowsPerPage, setRowsPerPage] = useState(5); // Rows per page

	/**
	 * Fetches the list of documents from the backend.
	 */
	const fetchDocuments = async () => {
		const response = await axios.get(`${BACKEND_URL}/spots/documents/`);
		if (response.status === 200) {
			setRequests(response.data);
		}
	};

	/**
	 * Handles the Accept action for a document.
	 *
	 * @param {number} id - The ID of the document to accept.
	 */
	const handleAccept = async (id) => {
		await axios.put(`${BACKEND_URL}/verify-list/request/accept/${id}`);
		fetchDocuments();
	};

	/**
	 * Handles the Deny action for a document.
	 *
	 * @param {number} id - The ID of the document to deny.
	 */
	const handleDeny = async (id) => {
		await axios.put(`${BACKEND_URL}/verify-list/request/reject/${id}`);
		fetchDocuments();
	};

	/**
	 * Handles changing the current page.
	 *
	 * @param {Object} event - The event object.
	 * @param {number} newPage - The new page number.
	 */
	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	/**
	 * Handles changing the number of rows per page.
	 *
	 * @param {Object} event - The event object.
	 */
	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0); // Reset to the first page
	};

	// Fetch documents on component load
	useEffect(() => {
		if (
			user.email == "abhishek.rajopadhye21@gmail.com" ||
			user.email == "arjunghule6583@gmail.com" ||
			user.email == "saad.ahmed+101@bluepineapple.io" ||
			user.email == "ahm33.saad@gmail.com" ||
			user.email == "saadah0143@gmail.com" ||
			user.email == "kalepradeep2001@gmail.com"
		) {
			fetchDocuments();
		}
	}, [user.email]);

	return (
		<Box sx={{ p: 3 }}>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell width="5vw">
								<strong>Sr.No</strong>
							</TableCell>
							<TableCell>
								<strong>Spot Title</strong>
							</TableCell>
							<TableCell>
								<strong>Identity Proof</strong>
							</TableCell>
							<TableCell>
								<strong>Ownership Proof Document</strong>
							</TableCell>
							<TableCell>
								<strong>Supporting Document(Optional)</strong>
							</TableCell>
							<TableCell width="15%">
								<strong>Actions</strong>
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{requests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((request, index) => (
							<React.Fragment key={request.spot_id}>
								<TableRow
									onClick={() => {
										if (collapseToggle === index) {
											setCollapseToggle(null);
										} else {
											setCollapseToggle(index);
										}
									}}
								>
									<TableCell>{page * rowsPerPage + index + 1}</TableCell>
									<TableCell>{request.spot_title}</TableCell>
									<TableCell>
										{request.documents["Identity Proof"] ? (
											<Typography variant="body2">
												📄 {request.documents["Identity Proof"].filename} -{" "}
												<a
													href={`${BACKEND_URL}/${request.documents["Identity Proof"].url}`}
													target="_blank"
													rel="noopener noreferrer"
													style={{
														color: "#1976d2",
														textDecoration: "underline",
													}}
												>
													View
												</a>
											</Typography>
										) : (
											<Typography variant="body2" color="textSecondary">
												Not Uploaded
											</Typography>
										)}
									</TableCell>

									<TableCell>
										{request.documents["Ownership Proof"] ? (
											<Typography variant="body2">
												📄 {request.documents["Ownership Proof"].filename} -{" "}
												<a
													href={`${BACKEND_URL}/${request.documents["Ownership Proof"].url}`}
													target="_blank"
													rel="noopener noreferrer"
													style={{
														color: "#1976d2",
														textDecoration: "underline",
													}}
												>
													View
												</a>
											</Typography>
										) : (
											<Typography variant="body2" color="textSecondary">
												Not Uploaded
											</Typography>
										)}
									</TableCell>
									<TableCell>
										{request.documents["Other Document"] ? (
											<Typography variant="body2">
												📄 {request.documents["Other Document"].filename} -{" "}
												<a
													href={`${BACKEND_URL}/${request.documents["Other Document"].url}`}
													target="_blank"
													rel="noopener noreferrer"
													style={{
														color: "#1976d2",
														textDecoration: "underline",
													}}
												>
													View
												</a>
											</Typography>
										) : (
											<Typography variant="body2" color="textSecondary">
												Not Uploaded
											</Typography>
										)}
									</TableCell>
									<TableCell align="right">
										<Button
											variant="contained"
											color="success"
											sx={{ mr: 1 }}
											onClick={(e) => {
												e.stopPropagation();
												handleAccept(request.spot_id);
											}}
										>
											Accept
										</Button>
										<Button
											variant="contained"
											color="error"
											onClick={(e) => {
												e.stopPropagation();
												handleDeny(request.spot_id);
											}}
										>
											Reject
										</Button>
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
										<Collapse in={collapseToggle === index} timeout="auto" unmountOnExit>
											<Container>
												<Typography variant="subtitle1" gutterBottom>
													Address:
												</Typography>
												<Typography>{request.spot_address}</Typography>
											</Container>
										</Collapse>
									</TableCell>
								</TableRow>
							</React.Fragment>
						))}
					</TableBody>
				</Table>
				<TablePagination
					rowsPerPageOptions={[5, 10, 20]}
					component="div"
					count={requests.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
				/>
			</TableContainer>
		</Box>
	);
};

export default Validation;
