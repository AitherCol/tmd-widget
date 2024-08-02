import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Donation from "./Donation";

function App() {
	const urlParams = new URLSearchParams(window.location.search);
	const token = urlParams.get("key");
	const [currentDonate, setCurrentDonate] = useState<any | null>(null);
	const queueRef = useRef<any[]>([]);
	const isProcessingRef = useRef<boolean>(false); // Флаг для отслеживания состояния обработки доната
	const [voices, setVoices] = useState<any[]>(
		window.speechSynthesis.getVoices()
	);

	useEffect(() => {
		const socket = io("https://socket.tipmeadollar.com", {
			reconnection: true,
			reconnectionDelayMax: 5000,
			reconnectionDelay: 1000,
		});

		socket.on("connect", () => {
			console.log("Connected to Socket.IO server");
			socket.emit("authenticate", JSON.stringify({ token }));
		});

		socket.on("donations:new", data => {
			const event = JSON.parse(data);
			console.log("New donation received", event);

			if (!queueRef.current.find(e => e.donation.id === event.donation.id)) {
				addDonationToQueue({ ...event, socket });
			}
		});

		window.speechSynthesis.onvoiceschanged = function () {
			setVoices(window.speechSynthesis.getVoices());
		};

		return () => {
			socket.disconnect();
		};
	}, []);

	const addDonationToQueue = (donation: any) => {
		queueRef.current.push(donation);
		if (!isProcessingRef.current) {
			nextDonation();
		}
	};

	const nextDonation = () => {
		if (queueRef.current.length > 0) {
			const nextDonate = queueRef.current.shift();
			setCurrentDonate(nextDonate);
			isProcessingRef.current = true;
		} else {
			setCurrentDonate(null);
			isProcessingRef.current = false;
		}
	};

	const handleEnd = () => {
		isProcessingRef.current = false;
		nextDonation();
	};

	return (
		<>
			{currentDonate ? (
				<Donation
					event={currentDonate}
					onEnd={handleEnd}
					token={token || ""}
					voices={voices}
				/>
			) : (
				<></>
			)}
		</>
	);
}

export default App;
