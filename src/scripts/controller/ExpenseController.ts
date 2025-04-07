import type { Participant, Expense } from '../model/interfaces.ts';
import { ExpensesView } from '../view/ExpensesView.ts';
import { StorageService } from '../utils/localStorageService.ts';

export class ExpenseController {
    #participants: Array<Participant>;
    #expenses: Array<Expense>;
    #addExpenseForm: HTMLFormElement;
    #view: ExpensesView;

    constructor() {
        this.#participants = StorageService.getParticipants();
        this.#expenses = StorageService.getExpenses();

        this.#view = new ExpensesView();

        this.#addExpenseForm = document.querySelector(
            '#add-expense-form'
        ) as HTMLFormElement;

        this.#addExpenseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddExpenseFormSubmit();
        });

        this.#view.renderExpenses(
            this.#expenses,
            this.attachSettlePaymentHandlers.bind(this)
        );

        this.attachThemeChangeHandler();
        this.handleAddParticipant();

        this.attachSettlePaymentHandlers();
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

        StorageService.saveParticipants(this.#participants);
        StorageService.saveExpenses(this.#expenses);
        this.#view.renderExpenses(
            this.#expenses,
            this.attachSettlePaymentHandlers.bind(this)
        );
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

        this.#view.renderExpenses(
            this.#expenses,
            this.attachSettlePaymentHandlers.bind(this)
        );

        this.#view.renderExpenseDetails(
            expense,
            this.attachSettlePaymentHandlers.bind(this)
        );

        StorageService.saveExpenses(this.#expenses);
    }

    getAllParticipants() {
        return this.#participants;
    }

    getAllExpenses() {
        return this.#expenses;
    }

    // Submit handler for Add Expense Form.
    handleAddExpenseFormSubmit() {
        // Utility function to get value of an input field.
        const getValue = (selector: string) =>
            (
                this.#addExpenseForm.querySelector(selector) as HTMLInputElement
            )?.value.trim() || '';

        const title = getValue('#title');
        const description = getValue('#description');
        const amount = Number(getValue('#amount'));
        const paidByPersonName = getValue('#paid-by');

        // Parse all the participant names as a string array.
        const participantNames: Array<string> = Array.from(
            this.#addExpenseForm.querySelector('.participants')?.children ?? []
        )
            .map((item) => {
                return item.textContent?.trim();
            })
            .filter((participant) => typeof participant === 'string');

        try {
            this.addNewExpense(
                title,
                description,
                amount,
                participantNames,
                paidByPersonName
            );
        } catch (err: unknown) {
            if (err instanceof Error) {
                alert(err.message);
                console.error(err.message);
            } else {
                console.error(err);
            }
        }

        // Close the popup after submission.
        const popup = this.#addExpenseForm.closest('div[popover]');
        if (popup instanceof HTMLDivElement) {
            popup.hidePopover();
        }
    }

    attachThemeChangeHandler() {
        const themeToggleBtn = document.querySelector(
            '#theme-toggle-btn'
        ) as HTMLButtonElement;

        this.#view.setTheme(StorageService.isDarkMode(), themeToggleBtn);

        themeToggleBtn.addEventListener('click', () => {
            if (document.body.classList.contains('dark-mode')) {
                this.#view.setTheme(false, themeToggleBtn);
            } else {
                this.#view.setTheme(true, themeToggleBtn);
            }
        });
    }

    handleAddParticipant() {
        const addParticipantBtn = this.#addExpenseForm.querySelector(
            '#add-participant'
        ) as HTMLButtonElement;

        addParticipantBtn.addEventListener('click', () => {
            const participantInput = this.#addExpenseForm.querySelector(
                '#participant'
            ) as HTMLInputElement;
            const participantName = participantInput.value;

            if (!participantName) return;

            this.#view.renderParticipant(participantName);

            participantInput.value = '';

            // Attach event handlers to Remove button for each participant.
            Array.from(
                this.#addExpenseForm.querySelector('.participants')?.children ??
                    []
            ).forEach((item) => {
                const name = item.textContent?.trim() ?? '';
                item.querySelector('img')?.addEventListener('click', () => {
                    item.remove();
                    this.#addExpenseForm
                        .querySelector(`#paid-by > option[value="${name}"]`)
                        ?.remove();
                });
            });

            participantInput.focus();
        });
    }

    attachSettlePaymentHandlers() {
        const expenceDetailContainer = document.querySelector(
            '.expense-detail'
        ) as HTMLElement;

        expenceDetailContainer
            .querySelectorAll('.expense-paid-btn')
            .forEach((paidBtn) => {
                if (!(paidBtn instanceof HTMLButtonElement)) return;
                paidBtn.addEventListener('click', () => {
                    const expenseId = paidBtn.dataset.expenseId;
                    const participantId = paidBtn.dataset.participantId;
                    if (!expenseId || !participantId) return;
                    this.settle(expenseId, participantId);
                });
            });
    }
}
