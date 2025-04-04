import type { Participant, Expense } from '../model/interfaces.ts';

export class ExpenseController {
    #participants: Array<Participant>;
    #expenses: Array<Expense>;

    constructor() {
        this.#participants = [];
        this.#expenses = [];
    }

    // Return a participant by name. Or create new one if doesn't exist.
    getParticipant(name: string): Participant {
        name = name.trim();

        const participantIndex = this.#participants.findIndex(
            (p) => p.name === name
        );

        if (participantIndex !== -1) {
            return this.#participants[participantIndex];
        }

        const participant: Participant = {
            id: crypto.randomUUID(),
            name,
            balance: 0,
        };

        this.#participants.push(participant);

        return participant;
    }

    // Add a new expenst.
    addNewExpense(
        title: string,
        description: string,
        amount: number,
        participantNames: Array<string>,
        paidByPersonName: string
    ) {
        if (!participantNames.includes(paidByPersonName)) {
            throw new Error('Person who paid is not included in participants.');
        }

        // Get participants from their names.
        const participants: Array<Participant> = participantNames.map((p) => {
            return this.getParticipant(p);
        });

        const paidBy = this.getParticipant(paidByPersonName);
        const notSettled = participants.filter((p) => p.name !== paidBy.name);
        const actualAmount = amount - amount / participants.length;

        // Update the balance of participants according to this expense.
        paidBy.balance += actualAmount;
        notSettled.forEach((p) => {
            p.balance -= actualAmount / notSettled.length;
        });

        const expense: Expense = {
            id: crypto.randomUUID(),
            title,
            description,
            amount: actualAmount,
            paidBy,
            settled: [],
            notSettled,
        };

        this.#expenses.push(expense);
    }

    getAllParticipants() {
        return this.#participants;
    }

    getAllExpenses() {
        return this.#expenses;
    }
}
