import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";

const Alert = React.lazy(() => import("./widgets/alert/Alert"));
const LastDonations = React.lazy(
	() => import("./widgets/last_donations/LastDonations")
);

function App() {
	return (
		<Suspense fallback={<></>}>
			<Routes>
				<Route path="/" element={<Alert />} />
				<Route path="/last_donations" element={<LastDonations />} />
				<Route path="*" element={<p>not found</p>} />
			</Routes>
		</Suspense>
	);
}

export default App;
