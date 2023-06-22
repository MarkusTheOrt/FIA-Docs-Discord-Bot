import Log from "./Log.js";
import { none, Option, some } from "./Option.js";

export default async <T>(
    promise: Promise<T>
): Promise<Option<Exclude<T, null | undefined>>> => {
    try {
        const data = await promise;
        if (data === null || data === undefined)
            return none;
        return some(data) as Option<Awaited<Exclude<T, null | undefined>>>;
    } catch (e) {
        Log.Stack(e as string);
        return none as Option<Exclude<T, null | undefined>>;
    }
};

async function TryHarder<T>(promise: Promise<T>): Promise<[T | null, any | null]> {
    try {
        const data = await promise;
        return [data, null];
    } catch (e) {
        return [null, e];
    }
}

export { TryHarder }
