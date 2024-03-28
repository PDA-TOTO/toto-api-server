import ApplicationError from '../error/applicationError';

export const toDate = (dateStr: string | undefined): Date | null => {
    if (!dateStr) {
        return null;
    }

    const tokens: string[] = dateStr.split('');

    let str = '';
    let year: number = 0;
    let month: number = 0;
    let day: number = 0;
    tokens.forEach((s) => {
        const num = Number(s);

        if (isNaN(num)) {
            if (s.toLowerCase() === 'y') {
                year = Number(str);
            } else if (s.toLowerCase() === 'm') {
                month = Number(str);
            } else if (s.toLowerCase() === 'd') {
                day = Number(str);
            } else {
                throw new ApplicationError(400, '잘못된 쿼리');
            }

            str = '';
        } else {
            str += s;
        }
    });

    const date = new Date();
    date.setFullYear(date.getFullYear() - year);
    date.setMonth(date.getMonth() - month);
    date.setDate(date.getDate() - day);
    return date;
};
