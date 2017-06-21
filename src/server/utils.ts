import { format } from 'util';

const errorMapping = {
    4006: 'Error parsing payload as JSON',
    4008: 'Unknown packet type',
    4009: 'Unknown method name call',
    4010: 'Error parsing method arguments (not the right type or structure)',
    4106: 'Unknown event "%s"',
    4108: 'Attempt to duplicate subscription to "%s"',
    4109: 'You are not subscribed to the "%s" livesubscribe event',
};

/**
 * Get an error message to reply back to the client.
 */
export function sendError(code: number, id: number, evt: string = null) {
    let message: string = null;
    if (evt) {
        message = format(errorMapping[code], evt);
    } else {
        message = errorMapping[code];
    }

    return JSON.stringify({ type: 'reply', result: null, error: { code, message }, id });
}

/**
 * Get the live event payload to send down the client.
 */
export function sendLive(slug: string, payload: any) {
    return JSON.stringify({ type: 'event', event: 'live', data: { channel: slug, payload } });
}
