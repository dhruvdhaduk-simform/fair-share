import type { Expense } from '../model/interfaces';
import { templates } from './template';
import { StorageService } from '../utils/localStorageService';

export class ExpensesView {
    #recentExpensesContainer: HTMLElement;
    #expenceDetailContainer: HTMLElement;
    #participants: HTMLElement;
    #participantPaidByOptions: HTMLElement;

    constructor() {
        this.#recentExpensesContainer = document.querySelector(
            '.recent-expenses'
        ) as HTMLElement;

        this.#expenceDetailContainer = document.querySelector(
            '.expense-detail'
        ) as HTMLElement;

        this.#participants = document.querySelector(
            '.participants'
        ) as HTMLElement;

        this.#participantPaidByOptions = document.querySelector(
            '#paid-by'
        ) as HTMLElement;
    }

    renderExpenses(
        expenses: Array<Expense>,
        attachEventHandlers: () => void
    ): void {
        if (!this.#recentExpensesContainer) return;

        this.#recentExpensesContainer.innerHTML = expenses
            .map(templates.recentExpenseList)
            .join('');

        this.handleViewDetailBtn(expenses, attachEventHandlers);
    }

    renderParticipant(name: string): void {
        if (!this.#participants || !this.#participantPaidByOptions) return;

        this.#participants.innerHTML += templates.formParticipants(name);

        this.#participantPaidByOptions.innerHTML +=
            templates.formPaidByOption(name);
    }

    handleViewDetailBtn(
        expenses: Array<Expense>,
        attachEventHandlers: () => void
    ) {
        const buttons = document.querySelectorAll('.view-details-button');

        buttons.forEach((btn) => {
            btn.addEventListener('click', (event) => {
                const expenseId = (event.target as HTMLElement).getAttribute(
                    'data-expense-id'
                );
                const selectedExpense = expenses.find(
                    (expense) => expense.id === expenseId
                );

                if (selectedExpense && this.#expenceDetailContainer) {
                    this.renderExpenseDetails(
                        selectedExpense,
                        attachEventHandlers
                    );
                }
            });
        });
    }

    renderExpenseDetails(expense: Expense, attachEventHandlers: () => void) {
        this.#expenceDetailContainer.innerHTML =
            templates.expenseDetails(expense);

        attachEventHandlers();
    }

    setTheme(toDarkMode: boolean, themeToggleBtn: HTMLButtonElement) {
        if (toDarkMode) {
            document.body.classList.add('dark-mode');
            themeToggleBtn.innerHTML = `
                    <img
                        src="${new URL('../../assets/icons/light-mode.svg', import.meta.url)}"
                        alt="light mode"
                    />
                `;
            StorageService.saveTheme(true);
        } else {
            document.body.classList.remove('dark-mode');
            themeToggleBtn.innerHTML = `
                    <img
                        src="${new URL('../../assets/icons/dark-mode.svg', import.meta.url)}"
                        alt="dark mode"
                    />
                `;

            StorageService.saveTheme(false);
        }
    }
}
