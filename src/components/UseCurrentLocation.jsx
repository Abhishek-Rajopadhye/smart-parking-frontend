import { useState } from "react";

export const UseCurrentLocation = () => {
	const [status, setStatus] = useState(""); // status: '', 'loading', 'success', 'error'
	const [errorMsg, setErrorMsg] = useState("");
	const [address, setAddress] = useState("");

	const detectLocation = () => {
		setStatus("loading");
		setErrorMsg("");

		if (!navigator.geolocation) {
			setStatus("error");
			setErrorMsg("Geolocation not supported.");
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const { latitude, longitude } = position.coords;
				const geocoder = new window.google.maps.Geocoder();

				geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
					if (status === "OK" && results[0]) {
						setAddress(results[0].formatted_address);
						setStatus("success");
					} else {
						setStatus("error");
						setErrorMsg("Failed to fetch address.");
					}
				});
			},
			(error) => {
				setStatus("error");
				console.log(error);
				setErrorMsg("Unable to detect location.");
			}
		);
	};

	return {
		detectLocation,
		status,
		errorMsg,
		address,
	};
};
