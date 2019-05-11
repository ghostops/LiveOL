export const today = () => {
    const d = new Date();

    const month = d.getMonth() + 1;
    const day = d.getDate();

    // tslint:disable
    const output = d.getFullYear() + '-' +
        (month < 10 ? '0' : '') + month + '-' +
        (day < 10 ? '0' : '') + day;
    // tslint:enable

    return output;
};
