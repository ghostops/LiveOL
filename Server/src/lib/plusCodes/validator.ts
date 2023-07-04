import { Cacher } from 'lib/redis';

// If you manage to "exploit" this, enjoy your free LiveOL+ :)

export class PlusCodeHandler {
	private availableCodes: string[];
	private claimedCodes: { deviceId: string; code: string }[];

	constructor(private cache: Cacher) {}

	public validatePlusCode = async (code: string, deviceId: string): Promise<boolean> => {
		await this.fetchPlusCodes();

		return this.claimedCodes.some((claimed) => claimed.code === code && claimed.deviceId === deviceId);
	};

	public redeemPlusCode = async (code: string, deviceId: string): Promise<void> => {
		await this.fetchPlusCodes();

		const codeClaimed = this.claimedCodes.some((claimed) => claimed.code === code);

		if (codeClaimed) {
			throw new Error('Code claimed');
		}

		const codeToClaim = this.availableCodes.find((claimable) => claimable === code);

		if (!codeToClaim) {
			throw new Error('Invalid code');
		}

		this.availableCodes = this.availableCodes.filter((available) => available !== code);
		this.claimedCodes = [...this.claimedCodes, { code, deviceId }];

		await this.savePlusCodes();
	};

	private fetchPlusCodes = async () => {
		const data = await this.cache.get('plusKeys');

		this.availableCodes = data.availableCodes;
		this.claimedCodes = data.claimedCodes;
	};

	private savePlusCodes = async () => {
		await this.cache.set('plusKeys', { availableCodes: this.availableCodes, claimedCodes: this.claimedCodes });
	};
}
