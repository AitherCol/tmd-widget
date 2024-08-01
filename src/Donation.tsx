import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { DonationEvent, FontSettings } from "./types";
import { formatMessage, formatName, sleep } from "./utils";

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
			if (timeout && timeout === 0) {
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
				if (event.page.voice_enabled) {
					if (event.page.voice_type === "maxim") {
						try {
							const audio = new Audio(
								`https://api.tipmeadollar.com/tts?text=${encodeURIComponent(
									formatMessage(event).voice.trim()
								)}&speed=${event.page.voice_speed}`
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
				await axios.post("https://api.tipmeadollar.com/internal/socket/read", {
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

	const getFontStyles = (settings: FontSettings) => {
		return {
			fontSize: settings.size,
			color: settings.color,
			fontWeight: settings.bold ? "bold" : "normal",
			fontStyle: settings.italic ? "italic" : "normal",
			fontDecoration: settings.underline ? "underline" : "none",
			textTransform: settings.transform,
			textShadow: `0px 0px ${settings.shadow_size}px ${
				settings.shadow_color
			}, 0px 0px ${settings.shadow_size + 1}px ${
				settings.shadow_color
			}, 0px 0px ${settings.shadow_size + 2}px ${
				settings.shadow_color
			}, 0px 0px ${settings.shadow_size + 3}px ${
				settings.shadow_color
			}, 0px 0px ${settings.shadow_size + 4}px ${settings.shadow_color}`,
		};
	};

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
