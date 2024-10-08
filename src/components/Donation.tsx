import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { DonationEvent } from "../types";
import { formatMessage, formatName, getFontStyles, sleep } from "../utils";

export default function Donation({
	event,
	onEnd,
	token,
	voices,
}: {
	event: DonationEvent;
	onEnd: () => void;
	token: string;
	voices: any[];
}) {
	const [fadeClass, setFadeClass] = useState("");
	const audioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		const endDonate = async (timeout?: number) => {
			if (timeout && timeout !== 0) {
				await sleep(timeout);
			}
			if (timeout !== 0) {
				// Начинаем эффект fade out
				setFadeClass("fade-out");

				// Ждем окончания анимации fade out
				await sleep(1000);
			}
			onEnd();
		};

		const playSound = () => {
			const playTts = () => {
				if (event.donation.audio) {
					const audio = new Audio(event.donation.audio);
					audio.volume = event.page.voice_volume_percent / 100;
					audioRef.current = audio;
					audio.play().catch(e => {
						console.error(e);
						endDonate(1500);
					});
					audio.onended = () => {
						endDonate(1500);
					};
				} else {
					if (
						formatMessage(event).voice.trim() !== "" &&
						event.page.voice_enabled &&
						event.donation.amount >= event.page.voice_min_amount
					) {
						if (event.page.voice_type !== "svetlana") {
							try {
								const audio = new Audio(
									`https://api.tipmeadollar.com/tts?text=${encodeURIComponent(
										formatMessage(event).voice.trim()
									)}&speed=${event.page.voice_speed}&voice=${
										event.page.voice_type
									}`
								);
								audio.volume = event.page.voice_volume_percent / 100;
								audioRef.current = audio;
								audio.play().catch(e => {
									console.error(e);
									endDonate(1500);
								});
								audio.onended = () => {
									endDonate(1500);
								};
							} catch (error) {
								console.error(error);
								endDonate(1500);
							}
						} else {
							const utterance = new SpeechSynthesisUtterance(
								formatMessage(event).voice.trim()
							);
							utterance.lang = "ru-RU";
							const voice = voices.find(
								e => e.name.startsWith("Google") && e.lang === "ru-RU"
							);
							if (voice) {
								utterance.voice = voice;
							}
							utterance.volume = event.page.voice_volume_percent / 100;
							utterance.rate = event.page.voice_speed;
							utterance.onend = () => {
								endDonate(1500);
							};
							speechSynthesis.speak(utterance);
						}
					} else {
						endDonate(event.widget.duration * 1000);
					}
				}
			};

			if (event.widget.sound) {
				if (audioRef.current) {
					audioRef.current.pause(); // Останавливаем предыдущий звук
					audioRef.current.currentTime = 0; // Сбрасываем время воспроизведения
				}

				try {
					const audio = new Audio(event.widget.sound);
					audio.volume = event.widget.sound_volume / 100;
					audioRef.current = audio;
					audio.play().catch(e => {
						console.error(e);
						playTts();
					});
					audio.onended = () => {
						playTts();
					};
				} catch (error) {
					playTts();
				}
			} else {
				playTts();
			}
		};

		(async () => {
			// Начинаем показ доната с эффектом fade in
			setFadeClass("");

			// Воспроизводим звук
			playSound();

			event.socket.on("donations:skip", () => {
				endDonate(0);
			});
		})();

		(async () => {
			try {
				await axios.post("https://api.tipmeadollar.com/public/donations/read", {
					id: event.donation.id,
					token,
				});
			} catch (error) {}
		})();

		// Функция очистки
		return () => {
			if (audioRef.current) {
				audioRef.current.pause(); // Останавливаем звук
				audioRef.current.currentTime = 0; // Сбрасываем время воспроизведения
				audioRef.current = null; // Очищаем ссылку на аудио
			}
			speechSynthesis.cancel();
			event.socket.off("donations:skip");
		};
	}, [event]);

	return (
		<div id="donation" className={`donation ${fadeClass}`}>
			<div className="donation-container-item">
				<div
					className="donation-image"
					id="donation-image"
					style={{
						backgroundImage: event.widget.image
							? `url(${event.widget.image})`
							: "",
					}}
				></div>
			</div>
			<div className="donation-container-item">
				<h1
					id="donation-title"
					className="donation-title"
					style={getFontStyles(event.widget.title_settings)}
				>
					{formatName(event)} – {event.donation.amount / 100}{" "}
					{event.donation.currency}!
				</h1>
			</div>
			<div className="donation-container-item">
				<p
					id="donation-message"
					className="donation-message"
					style={getFontStyles(event.widget.message_settings)}
				>
					{formatMessage(event).text}
				</p>
			</div>
		</div>
	);
}
