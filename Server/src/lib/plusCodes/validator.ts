import { getEnv } from 'lib/helpers/env';
import { Cacher } from 'lib/redis';
import axios from 'axios';

// If you manage to "exploit" this, enjoy your free LiveOL+ :)

const PLUS_KEYS_KEY = 'plusKeys';

const BASEROW_KEY = getEnv('BASEROW_KEY', false);
const BASEROW_TABLE = getEnv('BASEROW_TABLE');

const apiClient = axios.create({
	baseURL: `https://api.baserow.io/api`,
	headers: {
		Authorization: `Token ${BASEROW_KEY}`,
	},
});

export class PlusCodeHandler {
	private availableCodes: { code: string; id: number }[];
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

		const codeToClaim = this.availableCodes.find((claimable) => claimable.code === code);

		if (!codeToClaim) {
			throw new Error('Invalid code');
		}

		this.availableCodes = this.availableCodes.filter((available) => available.code !== code);
		this.claimedCodes = [...this.claimedCodes, { code, deviceId }];

		await this.claimPlusCode(codeToClaim.id, deviceId);
	};

	private fetchPlusCodes = async () => {
		try {
			const res = await apiClient.get(`/database/rows/table/${BASEROW_TABLE}/?user_field_names=true`);

			this.availableCodes = res.data.results.filter((item) => !item.Claimed).map((item) => ({ code: item.Code, id: item.id }));
			this.claimedCodes = res.data.results
				.filter((item) => item.Claimed)
				.map((item) => ({ code: item.Code, deviceId: item.DeviceID }));
		} catch (err) {
			console.error('Failed to fetch Plus Codes', err.response.data);
		}
	};

	private claimPlusCode = async (id: number, deviceId: string) => {
		try {
			await apiClient.patch(
				`https://api.baserow.io/api/database/rows/table/${BASEROW_TABLE}/${id}/?user_field_names=true`,
				{ DeviceID: deviceId, Claimed: true },
			);
		} catch (err) {
			console.error('Failed to claim Plus Code', err.response.data);
		}
	};
}
