export class EventorApi {
    constructor(
        private apiKey: string,
    ) {}

    public getClubs = async () => {
        console.log(this.apiKey);
    }
}
