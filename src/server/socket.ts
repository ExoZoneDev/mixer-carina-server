import { Data, Server } from 'ws';
import * as WebSocket from 'ws';

import { IConfig } from '../../lib/config';
import { CarinaEvents } from '../events';
import { Subscriptions } from './subscriptions';
import { sendError } from './utils';

export interface IPacket {
    id: number;
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
    method: string;
    params: {
        [method: string]: any;
        events: string[];
        interval: number;
    };
}

export class CarinaServer {
    private events: CarinaEvents = new CarinaEvents();

    protected server: Server;
    protected clients: Map<string, WebSocket> = new Map<string, WebSocket>();
    protected subscriptions: Map<string, Subscriptions> = new Map<string, Subscriptions>();

    constructor(config: IConfig) {
        this.server = new Server({ port: config.port, host: config.host });
        console.log('[Carina Server] Starting server...');

        this.server.on('connection', (client, req) => {
            console.log('[Carina Server] Got a new connection.');
            const clientId = req.headers['sec-websocket-key'].toString();
            this.clients.set(clientId, client);
            this.subscriptions.set(clientId, new Subscriptions(client, this.events));

            // Send the auth event to show we are ready.
            client.send(JSON.stringify({ type: 'event', event: 'hello', data: { authenticated: true } }));

            // Listen to messages and parse them.
            client.on('message', data => this.parseMessage(client, clientId, data));

            // When a client closes the connection remove all the trackers we have for them.
            client.on('close', () => {
                console.log('[Carina Server] Client disconnected.');
                this.clients.delete(clientId);
                this.subscriptions.get(clientId).clearAll();
                this.subscriptions.delete(clientId);
            });
        });
    }

    /**
     * Parse a message which was sent from the client.
     */
    private parseMessage(client: WebSocket, clientId: string, data: Data) {
        let packet: IPacket = null;
        try {
            packet = JSON.parse(data.toString());
        } catch (err) {
            return client.send(sendError(4006, null));
        }

        // Handle the method and create the fake subscriptions.
        switch (packet.method) {
            case 'livesubscribe':
                try {
                    const subscriptions = this.subscriptions.get(clientId);
                    subscriptions.subscribe(packet.params.events, packet.params.interval);

                    return client.send(JSON.stringify({ type: 'reply', result: null, error: null, id: packet.id }));
                } catch (err) {
                    if (err instanceof TypeError) {
                        const parts = err.message.split('-');

                        return client.send(sendError(Number(parts[0]), packet.id, parts[1]));
                    }
                }
                break;
            case 'liveunsubscribe':
                try {
                    const subscriptions = this.subscriptions.get(clientId);
                    subscriptions.unsubscribe(packet.params.events);

                    return client.send(JSON.stringify({ type: 'reply', result: null, error: null, id: packet.id }));
                } catch (err) {
                    if (err instanceof TypeError) {
                        const parts = err.message.split('-');

                        return client.send(sendError(Number(parts[0]), packet.id, parts[1]));
                    }
                }
                break;
            default:
                return client.send(sendError(4106, packet.id, packet.method));
        }
    }
}
