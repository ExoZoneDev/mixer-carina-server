import * as config from 'config';
import * as WebSocket from 'ws';

import { CarinaEvents } from '../events';
import { sendLive } from './utils';

export class Subscriptions {
    private slugs: string[] = [];
    private trackers: { [slug: string]: NodeJS.Timer; } = {};

    constructor(private client: WebSocket, private events: CarinaEvents) {}

    /**
     * Subscribe to an event using the slugs.
     */
    public subscribe(slugs: string[], interval: number = 3000) {
        if (isNaN(interval)) { // Check that the value given custom is a number also; if not fallback.
            interval = 3000;
        }
        if (interval > config.get('maxInterval')) {
            interval = 3000;
        }
        slugs.forEach(slug => {
            if (!this.events.isValid(slug)) {
                throw TypeError(`4106-${slug}`);
            }
            if (this.slugs.includes(slug)) {
                throw TypeError(`4108-${slug}`);
            }
            this.slugs.push(slug);
            console.log(`[Subscriptions] Creating interval for ${slug}`);
            this.startEvent(slug, interval); // Start the tracking/ticker for the slug.
        });
    }

    /**
     * Un-Subscribe to an event using the slugs.
     */
    public unsubscribe(slugs: string[]) {
        slugs.forEach(slug => {
            if (!this.events.isValid(slug)) {
                throw TypeError(`4106-${slug}`);
            }
            if (!this.slugs.includes(slug)) {
                throw TypeError(`4109-${slug}`);
            }
            clearInterval(this.trackers[slug]);
            delete this.trackers[slug];
        });
    }

    /**
     * Remove all trackers for the current client.
     */
    public clearAll() {
        Object.keys(this.trackers).forEach(slug => clearInterval(this.trackers[slug]));
    }

    /**
     * Start an event tracker for the slug given.
     */
    private startEvent(slug: string, interval: number) {
        this.trackers[slug] = setInterval(() => this.client.send(sendLive(slug, this.events.getPayload(slug))), interval);
    }
}
