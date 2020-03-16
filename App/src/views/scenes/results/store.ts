import { getClass } from 'lib/api';
import { API_CACHES } from 'store/stores/api';

export const poll = async (id: number, className: string): Promise<Result[]> => {
    const results = await getClass(id, className);
    await API_CACHES.results(`${id}:${className}`).set(results);

    return results.results;
};
