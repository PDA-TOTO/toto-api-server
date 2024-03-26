export type Account = {
    account: string,
    id : number,
    amount : number
}

export type VisibleUser = {
    id: number;
    email: string;
    experience: number;
    account: Account;
    tendency: number|null;
    createdAt: Date;
};
