import axios from "axios";
import moment from "moment";
import "moment/dist/locale/ru";
import { useEffect, useState } from "react";
import FadeIn from "react-fade-in/lib/FadeIn";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { io } from "socket.io-client";
import useInterval from "../../hooks/useInterval";
import { Donation } from "../../types";
import "./LastDonations.css";

moment.locale("ru");

export default function LastDonations() {
	const urlParams = new URLSearchParams(window.location.search);
	const token = urlParams.get("key");

	const [donations, setDonations] = useState<Donation[]>([]);

	useEffect(() => {
		(async () => {
			try {
				const { data } = await axios.get(
					`https://api.tipmeadollar.com/internal/socket/donations?page=1&limit=25&token=${token}`
				);
				setDonations(data.donations.data);
			} catch (error) {
				toast.error("произошла неизвестная ошибка!");
			}
		})();
	}, []);

	useEffect(() => {
		const socket = io("https://socket.tipmeadollar.com", {
			reconnection: true,
			reconnectionDelayMax: 5000,
			reconnectionDelay: 1000,
		});

		socket.on("connect", () => {
			console.log("Connected to Socket.IO server");
			socket.emit("authenticate", JSON.stringify({ token, ignoreNew: true }));
		});

		socket.on("donations:new", data => {
			const event = JSON.parse(data);
			console.log("New donation received", event);

			setDonations(prevDonations => {
				// Проверяем, есть ли уже донат с таким id
				if (!prevDonations.find(e => e.id === event.donation.id)) {
					return [event.donation, ...prevDonations];
				}
				return prevDonations;
			});
		});

		return () => {
			socket.disconnect();
		};
	}, [token]);

	const DonationComponent = ({ donation }: { donation: Donation }) => {
		const [time, setTime] = useState(moment(donation.paid_at).fromNow());

		useInterval(() => {
			setTime(moment(donation.paid_at).fromNow());
		}, 1000);

		return (
			<FadeIn>
				<div className="donation">
					<p className="donation-title">
						<b>{donation.name || "аноним"}</b> отправил{" "}
						<b>
							{donation.amount / 100} {donation.currency}
						</b>
					</p>
					{donation.message && (
						<p className="donation-message">{donation.message}</p>
					)}
					{donation.audio && <audio controls src={donation.audio} />}
					<p className="donation-date">{time}</p>
				</div>
			</FadeIn>
		);
	};

	return (
		<div className="donation-list">
			<ToastContainer
				position="bottom-center"
				autoClose={5000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				toastStyle={{ backgroundColor: "#202020" }}
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme="dark"
			/>
			{donations.length === 0 ? (
				<div className="not-found">
					<p className="not-found-text">донатов не найдено</p>
				</div>
			) : (
				<>
					<button
						className="skip-button"
						onClick={async () => {
							try {
								await axios.post(
									`https://api.tipmeadollar.com/internal/socket/skip`,
									{ token: token }
								);
								toast.success("донат пропущен!");
							} catch (error) {
								toast.error("произошла неизвестная ошибка!");
							}
						}}
					>
						пропустить текущий донат
					</button>
					{donations.map(donation => (
						<DonationComponent donation={donation} />
					))}
				</>
			)}
		</div>
	);
}
