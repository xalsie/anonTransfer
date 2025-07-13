export class EventEmitter<T = unknown> {
	private listeners: { [event: string]: Array<(payload: T) => void> } = {};

	on(event: string, listener: (payload: T) => void) {
		if (!this.listeners[event]) this.listeners[event] = [];
		this.listeners[event].push(listener);
	}

	emit(event: string, payload: T) {
		(this.listeners[event] || []).forEach((listener) => listener(payload));
	}
}
