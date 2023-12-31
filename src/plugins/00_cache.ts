import moment from "moment";

type CacheEntry = { data: any, expiration: moment.Moment };

const prepareCacheKey = (key: string): string => `km-${key.replaceAll(' ', '-').toLowerCase()}`;

const getItemFromLocalStorage = <T>(key: any): T | undefined => {
    const ck = prepareCacheKey(key);
    const value = localStorage.getItem(ck);
    if (!value) {
        return undefined;
    }

    const entry = JSON.parse(value) as CacheEntry;
    if (!entry || moment.utc().isAfter(entry.expiration)) {
        localStorage.removeItem(ck);
        return undefined;
    }

    return entry.data as T;
}

const setItemInternal = <T>(key: string,
    data: T,
    expiration: number): void => {

    const ck = prepareCacheKey(key);
    const entry: CacheEntry =
    {
        data: data,
        expiration: moment.utc().add(expiration, 'seconds')
    }
    localStorage.setItem(ck, JSON.stringify(entry))
}

const removeItemInternal = <T>(key: string,): void => {
    localStorage.removeItem(key)
}

export default defineNuxtPlugin((nuxtApp) => {
    return {
        provide: {
            cache: {
                set: async<T>(key: string,
                    data: T,
                    expiration: number): Promise<void> => {

                    if (data) {
                        setItemInternal<T>(key, data, expiration);
                    }
                },

                remove: async (key: string): Promise<void> => {
                    const ck = prepareCacheKey(key);
                    removeItemInternal(ck)
                },

                removeByPrefix: (prefix: string): void => {
                    const kmPrefix = prepareCacheKey(prefix);
                    const keysToRemove: string[] = [];
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);

                        if (key?.startsWith(kmPrefix)) {
                            keysToRemove.push(key);
                        }
                    }

                    for (let i = 0; i < keysToRemove.length; i++) {
                        removeItemInternal(keysToRemove[i]);
                    }
                },

                get: async <T>(key: string): Promise<T | undefined | null> => getItemFromLocalStorage<T>(key),

                getOrAcquire: async<T>(key: string,
                    acquire: () => Promise<T>,
                    expiration: number): Promise<T | undefined | null> => {

                    let item = getItemFromLocalStorage<T>(key);
                    if (item) {
                        return item;
                    }

                    const av = await acquire();
                    if (av) {
                        setItemInternal<T>(key, av, expiration);
                    }
                    return av;
                }
            }
        }
    }
});