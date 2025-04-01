import { useState } from "react";
import { Container, Tabs, Tab } from "@mui/material";
import { UserBookingView } from "../components/UserBookingView";
import { OwnerBookingView } from "../components/OwnerBookingView";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

const BookingHistory = () => {
	const [tabIndex, setTabIndex] = useState("0");

	return (
		<Container sx={{ mt: 3, mr: 50 }}>
			<TabContext value={tabIndex}>
				<TabList onChange={(e, newIndex) => setTabIndex(newIndex)} variant="fullWidth" centered>
					<Tab label="User Bookings" value="0" sx={{ color: "white" }} />
					<Tab label="Owner Bookings" value="1" sx={{ color: "white" }} />
				</TabList>
				<TabPanel value="0" index="0">
					<UserBookingView />
				</TabPanel>
				<TabPanel value="1" index="1">
					<OwnerBookingView />
				</TabPanel>
			</TabContext>
		</Container>
	);
};

export { BookingHistory };
