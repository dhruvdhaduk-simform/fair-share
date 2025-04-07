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

        if (!name) {
            throw new Error('Participant name cannot be empty.');
        }

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
        title = title.trim();
        description = description.trim();
        participantNames = participantNames.map((p) => p.trim());
        paidByPersonName = paidByPersonName.trim();

        if (!title) {
            throw new Error('Expense title cannot be empty.');
        }

        if (!description) {
            throw new Error('Expense description cannot be empty.');
        }

        if (!paidByPersonName) {
            throw new Error('Name of the paidby person cannot be empty.');
        }

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

    // Settle an expense for a particular participant.
    settle(expenseId: string, participantId: string) {
        // Find the expense from its ID.
        const expense = this.#expenses.find((exp) => exp.id === expenseId);
        if (!expense) {
            throw new Error('Expense with specified ID not found.');
        }

        // Find the participant from "notSettled" array.
        const participantIndex = expense.notSettled.findIndex(
            (p) => p.id === participantId
        );
        if (participantIndex === -1) {
            throw new Error(
                'Participant with specified ID not found in this expense.'
            );
        }

        const participant = expense.notSettled[participantIndex];
        const amountPaid = expense.amount / expense.notSettled.length;

        // Update the expense and balance of participants.
        expense.notSettled.splice(participantIndex, 1);
        expense.settled.push(participant);
        expense.amount -= amountPaid;
        expense.paidBy.balance -= amountPaid;
        participant.balance += amountPaid;
    }

    getAllParticipants() {
        return this.#participants;
    }

    getAllExpenses() {
        return this.#expenses;
    }
}
