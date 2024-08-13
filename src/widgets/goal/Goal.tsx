import axios from "axios";
import moment from "moment";
import "moment/dist/locale/ru";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { io } from "socket.io-client";
import { Goal as GoalType } from "../../types";
import { calculateProgress, getFontStyles } from "../../utils";

import "./Goal.css";

moment.locale("ru");

function Goal() {
	const urlParams = new URLSearchParams(window.location.search);
	const token = urlParams.get("key");
	const id = urlParams.get("id");
	const [goal, setGoal] = useState<GoalType>();

	const getGoal = async () => {
		try {
			const { data } = await axios.get(
				`https://api.tipmeadollar.com/internal/socket/goal?id=${id}&token=${token}`
			);

			setGoal(data.goal);
		} catch (error) {
			toast.error("произошла неизвестная ошибка!");
		}
	};

	useEffect(() => {
		getGoal();
	}, []);

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
			getGoal();
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	return (
		<div className="widget">
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

			{goal ? (
				<div className="goal-page">
					<div className="goal">
						<div className="goal-header">
							<p
								className="goal-title goal-text"
								style={getFontStyles(goal.title_settings, "vw")}
							>
								{goal.title}
							</p>
						</div>
						<div
							className="goal-body"
							style={{ minHeight: `${goal.indicator_height}vw` }}
						>
							<div
								className="goal-progress-bar"
								style={{
									backgroundColor: goal.indicator_color,
									borderRadius: `${goal.border_radius}vw`,
									minHeight: `${goal.indicator_height}vw`,
								}}
							>
								<div
									className="progress-bar-filler"
									style={{
										backgroundColor: goal.indicator_filled_color,
										right: `${
											100 -
											calculateProgress(goal.amount, goal.goal_amount, true)
										}%`,
										transition: "right 1ms",
									}}
								></div>
							</div>
							<p
								className="goal-progress-text goal-text"
								style={getFontStyles(goal.progress_settings, "vw")}
							>
								{goal.amount / 100} {goal.currency} (
								{calculateProgress(goal.amount, goal.goal_amount).toFixed(0)}%)
							</p>
						</div>

						<div className="goal-footer">
							{goal.show_goal_borders ? (
								<div className="goal-borders">
									<p
										className="goal-progress-text goal-border start"
										style={{
											...getFontStyles(goal.borders_settings, "vw"),
											textAlign: "start",
										}}
									>
										0
									</p>

									<p
										className="goal-progress-text goal-border end"
										style={{
											...getFontStyles(goal.borders_settings, "vw"),
											textAlign: "end",
										}}
									>
										{goal.goal_amount / 100}
									</p>
								</div>
							) : (
								<></>
							)}
							{goal.show_remaining_time && goal.end_at && !goal.ended_at ? (
								<p
									className="goal-time-left goal-text"
									style={{
										...getFontStyles(goal.remaining_time_settings, "vw"),
										textAlign: "center",
									}}
								>
									Осталось {moment(goal.end_at).fromNow(true)}
								</p>
							) : (
								<></>
							)}
							{goal.ended_at && (
								<p
									className="goal-time-left goal-text"
									style={{
										...getFontStyles(goal.remaining_time_settings, "vw"),
										textAlign: "center",
									}}
								>
									Сбор завершен
								</p>
							)}
						</div>
					</div>
				</div>
			) : (
				<></>
			)}
		</div>
	);
}

export default Goal;
