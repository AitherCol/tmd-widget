export interface DonationEvent {
	donation: Donation;
	widget: Widget;
	page: Page;
	socket?: any;
}

export interface Donation {
	id: number;
	name: string;
	message: string | null;
	amount: number;
	currency: string;
	audio: string | null;
	paid_at: string;
}

export interface Widget {
	id: number;
	duration: number;
	image: string | null;
	sound: string | null;
	sound_volume: number;
	title_settings: FontSettings;
	message_settings: FontSettings;
}

export interface FontSettings {
	size: number;
	color: string;
	bold: boolean;
	italic: boolean;
	underline: boolean;
	transform: "uppercase" | "lowercase" | "none";
	shadow_size: number;
	shadow_color: string;
}

export interface Page {
	id: number;
	user_id: number;
	voice_enabled: boolean;
	voice_min_amount: number;
	voice_volume_percent: number;
	remove_links: boolean;
	blacklisted_words: string[];
	created_at: string;
	voice_speed: number;
	voice_type: "maxim" | "svetlana";
}
