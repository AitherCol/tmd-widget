import { DonationEvent } from "./types";

export function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatName(event: DonationEvent) {
	if (!event.donation.name) {
		return "Аноним";
	}
	return removeBlacklistedWords(
		event.donation.name,
		event.page.blacklisted_words,
		"*****"
	);
}

export function formatMessage(event: DonationEvent) {
	if (!event.donation.message) {
		return { text: "", voice: "" };
	}
	let text = removeBlacklistedWords(
		event.donation.message,
		event.page.blacklisted_words,
		"*****"
	);
	let voiceText = removeBlacklistedWords(
		event.donation.message,
		event.page.blacklisted_words
	);
	if (event.page.remove_links) {
		text = removeLinks(text, "[ссылка удалена]");
		voiceText = removeLinks(text);
	}
	return { text, voice: removeEmojis(voiceText) };
}

export function removeBlacklistedWords(
	text: string,
	blacklist: string[],
	replaceTo?: string
) {
	let output = text;
	for (const word of blacklist.filter(e => e.trim() !== "")) {
		const regex = new RegExp(word, "gi"); // 'g' - глобальный поиск, 'i' - игнорирование регистра
		output = output.replace(regex, replaceTo || "");
	}
	return output;
}

export function removeLinks(text: string, replaceTo?: string) {
	// Регулярное выражение для поиска ссылок
	const urlPattern =
		/http[s]?:\/\/(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/g;
	// Замена всех ссылок на "[ссылка удалена]"
	const cleanedText = text.replace(urlPattern, replaceTo || "");
	return cleanedText;
}

export function removeEmojis(text: string) {
	// Регулярное выражение для поиска эмодзи
	const emojiRegex =
		/([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]|\u24C2|[\u25A0-\u25FF]|\u2600-\u26FF|\u2B50|[\u2300-\u23FF]|\u3297|\u3299|[\u2049\u203C]|[\u2000-\u200F]|[\u2028-\u202F]|[\u205F-\u2060]|[\u2190-\u21FF])/g;

	// Замена эмодзи на пустую строку
	return text.replace(emojiRegex, "");
}
