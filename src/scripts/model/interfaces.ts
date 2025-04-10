export interface Participant {
    id: string;
    name: string;
    balance: number;
}

export interface Expense {
    id: string;
    title: string;
    description: string;
    originalAmount: number;
    calculatedAmount: number;
    paidBy: Participant;
    settled: Array<Participant>;
    notSettled: Array<Participant>;
}

export interface AppData {
    expenses: Array<Expense>;
    isDarkMode: boolean;
    participants: Array<Participant>;
}
