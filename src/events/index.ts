import * as fs from 'fs';
import * as glob from 'glob';
import { resolve } from 'path';

export interface IEvent {
    slug: string;
    events: Object[];
}

export class CarinaEvents {
    protected events: { [slug: string]: IEvent; } = {};

    constructor() {
        glob(`${resolve(__dirname, '../../events/*.json')}`, async(err, files) => {
            if (err) {
                console.error('[Events Loading] Cannot read the events folder.', err);
            }
            // tslint:disable-next-line:one-variable-per-declaration prefer-const
            for (let i = 0, length = files.length; i < length; i++) {
                const file = files[i];
                const data = await fs.readFileSync(file, 'utf8');
                const evt: IEvent = JSON.parse(data);
                this.events[evt.slug] = evt;
            }
        });
    }

    /**
     * Is the slug given valid.
     */
    public isValid(slug: string) {
        return !!this.events[this.getInternalSlug(slug)];
    }

    /**
     * Get a payload for a slug.
     */
    public getPayload(slug: string) {
        const events = this.events[this.getInternalSlug(slug)].events;
        return events[Math.floor(Math.random() * events.length)];
    }

    /**
     * Convert the slug we get from Carina clients to the internal naming of slugs.
     */
    private getInternalSlug(slug: string) {
        const slugParts = slug.split(':');
        if (!isNaN(Number(slugParts[1]))) {
            slugParts[1] = '{id}';
        }

        return slugParts.join(':');
    }
}
