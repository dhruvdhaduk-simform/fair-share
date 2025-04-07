import type { Expense, Participant, AppData } from '../model/interfaces';

export class StorageService {
    private static readonly EXPENSE_KEY = 'fairShare-app-data';
    private static readonly PARTICIPANT_KEY = 'fairShare-app-participants';
    private static readonly TOGGLE_KEY = 'fairShare-app-toggletheme';

    static saveAppData(appData: AppData): void {
        this.saveExpenses(appData.expenses);
        this.saveParticipants(appData.participants);
        this.saveTheme(appData.isDarkMode);
    }

    static getExpenses(): Array<Expense> {
        const expense = localStorage.getItem(this.EXPENSE_KEY);
        return expense ? JSON.parse(expense) : [];
    }

    static saveExpenses(expense: Array<Expense>): void {
        if (!expense) return;
        localStorage.setItem(this.EXPENSE_KEY, JSON.stringify(expense));
    }

    static getParticipants(): Array<Participant> {
        const participant = localStorage.getItem(this.PARTICIPANT_KEY);
        return participant ? JSON.parse(participant) : [];
    }

    static saveParticipants(participant: Array<Participant>): void {
        if (!participant) return;
        localStorage.setItem(this.PARTICIPANT_KEY, JSON.stringify(participant));
    }

    static isDarkMode(): boolean {
        const toggle = localStorage.getItem(this.TOGGLE_KEY);
        return toggle ? JSON.parse(toggle) : false;
    }

    static saveTheme(isDarkMode: boolean): void {
        localStorage.setItem(this.TOGGLE_KEY, JSON.stringify(isDarkMode));
    }
}
