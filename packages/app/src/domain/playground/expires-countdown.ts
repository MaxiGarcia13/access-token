import { formatExpiresIn } from '@/utils/format-expires-in';

function readExpiresAtMs(el: HTMLElement): number | null {
	const raw = el.dataset.expiresAtMs;

	if (!raw) {
		return null;
	}

	const expiresAt = Number(raw);
	return Number.isFinite(expiresAt) ? expiresAt : null;
}

function markExpired(statusEl: HTMLElement | undefined) {
	if (!statusEl || statusEl.dataset.state === 'pending') {
		return;
	}

	statusEl.textContent = 'Expired';
	statusEl.dataset.state = 'error';
}

export function setExpiresAtMs(el: HTMLElement, expiresAt: number | null, statusEl?: HTMLElement) {
	if (expiresAt === null) {
		delete el.dataset.expiresAtMs;
	} else {
		el.dataset.expiresAtMs = String(expiresAt);
	}

	const label = formatExpiresIn(expiresAt);
	el.textContent = label;

	if (label === 'expired') {
		markExpired(statusEl);
	}
}

export function startExpiresCountdown(el: HTMLElement, statusEl?: HTMLElement) {
	const tick = () => {
		const label = formatExpiresIn(readExpiresAtMs(el));
		el.textContent = label;

		if (label === 'expired') {
			markExpired(statusEl);
		}
	};

	tick();
	const intervalId = window.setInterval(tick, 1000);

	return () => {
		window.clearInterval(intervalId);
	};
}
