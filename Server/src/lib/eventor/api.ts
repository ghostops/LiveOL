import { Cacher } from "lib/redis";

export class EventorApi {
    constructor(
        private apiKey: string,
        private cache: Cacher,
    ) {}

    public getClubs = async () => {
        console.log(this.apiKey);
    }
}
