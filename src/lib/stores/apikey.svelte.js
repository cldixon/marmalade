/**
 * Isolated API key management — intentionally separate from settings store.
 * Persisted in localStorage, never serialized with other settings.
 */
const STORAGE_KEY = 'marmalade-openai-api-key';

let _key = $state('');

export const apiKey = {
	get value() {
		return _key;
	},
	set value(v) {
		_key = v;
		if (v) {
			localStorage.setItem(STORAGE_KEY, v);
		} else {
			localStorage.removeItem(STORAGE_KEY);
		}
	},
	get isSet() {
		return _key.length > 0;
	},
	load() {
		_key = localStorage.getItem(STORAGE_KEY) || '';
	}
};
