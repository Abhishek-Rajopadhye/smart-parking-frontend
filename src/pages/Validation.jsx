import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import axios from "axios";
import { BACKEND_URL } from "../const";

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
	const [requests, setRequests] = useState([]);

	/**
	 * Fetches the list of documents from the backend.
	 */
	const fetchDocuments = async () => {
		// const response = await axios.get(`${BACKEND_URL}/verfiy-list`);
        // if(response.status == 200){
        //     setRequests(response.data);
        // }
        setRequests({
            
        })
	};

	/**
	 * Handles the Accept action for a document.
	 *
	 * @param {number} id - The ID of the document to accept.
	 */
	const handleAccept = async(id) => {
        const response = await axios.put(`${BACKEND_URL}/verify-list/request/accept/${id}`);
        console.log(response.data)
	};

	/**
	 * Handles the Deny action for a document.
	 *
	 * Placeholder function for now.
	 *
	 * @param {number} id - The ID of the document to deny.
	 */
	const handleDeny = async (id) => {
        const response = await axios.put(`${BACKEND_URL}/verify-list/request/reject/${id}`);
        console.log(response.data)
	};

	// Fetch documents on component load
	useEffect(() => {
		fetchDocuments();
	}, []);

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h4" gutterBottom>
				Document Validation
			</Typography>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>
								<strong>Identity Proof</strong>
							</TableCell>
							<TableCell>
								<strong>Ownership Proof Document</strong>
							</TableCell>
							<TableCell>
								<strong>NOC</strong>
							</TableCell>
							<TableCell>
								<strong>Actions</strong>
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{requests.map((request) => (
							<TableRow key={request.id}>
								<TableCell>{request.identityProof}</TableCell>
								<TableCell>{request.ownershipProof}</TableCell>
								<TableCell>{request.noc}</TableCell>
								<TableCell>
									<Button
										variant="contained"
										color="success"
										sx={{ mr: 1 }}
										onClick={() => handleAccept(request.id)}
									>
										Accept
									</Button>
									<Button variant="contained" color="error" onClick={() => handleDeny(request.id)}>
										Deny
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
};

export default Validation;
