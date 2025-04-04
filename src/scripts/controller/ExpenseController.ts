import type { Participant, Expense } from '../model/interfaces.ts';

export class ExpenseController {
    #participants: Array<Participant>;
    #expenses: Array<Expense>;

    constructor() {
        this.#participants = [];
        this.#expenses = [];

        console.log(this.#participants);
        console.log(this.#expenses);
    }

    getAllParticipants() {
        return this.#participants;
    }

    getAllExpenses() {
        return this.#expenses;
    }
}
