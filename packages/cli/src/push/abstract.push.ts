import { type Readable } from 'stream';
import { JsonStreamStringify } from 'json-stream-stringify';
import { LoggerProxy as Logger } from 'n8n-workflow';
import type { IPushDataType } from '@/Interfaces';

export abstract class AbstractPush<T> {
	protected connections: Record<string, T> = {};

	protected abstract close(connection: T): void;
	protected abstract sendTo(clients: T[], stream: Readable): Promise<void>;
	protected abstract pingAll(): void;

	constructor() {
		// Ping all connected clients every 60 seconds
		setInterval(() => this.pingAll(), 60 * 1000);
	}

	protected add(sessionId: string, connection: T): void {
		const { connections } = this;
		Logger.debug('Add editor-UI session', { sessionId });

		const existingConnection = connections[sessionId];
		if (existingConnection) {
			// Make sure to remove existing connection with the same id
			this.close(existingConnection);
		}

		connections[sessionId] = connection;
	}

	protected remove(sessionId: string): void {
		Logger.debug('Remove editor-UI session', { sessionId });
		delete this.connections[sessionId];
	}

	async send<D>(type: IPushDataType, data: D, sessionId: string) {
		const { connections } = this;
		if (connections[sessionId] === undefined) {
			Logger.error(`The session "${sessionId}" is not registered.`, { sessionId });
			return;
		}

		Logger.debug(`Send data of type "${type}" to editor-UI`, { dataType: type, sessionId });

		return this.sendTo([connections[sessionId]], this.createStream(type, data));
	}

	async broadcast<D>(type: IPushDataType, data?: D) {
		return this.sendTo(Object.values(this.connections), this.createStream(type, data));
	}

	private createStream<D>(type: IPushDataType, data?: D) {
		return new JsonStreamStringify({ type, data }, undefined, undefined, true);
	}
}
