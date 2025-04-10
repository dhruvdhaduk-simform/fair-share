import type { Expense } from '../model/interfaces';
import { templates } from './template';
import { StorageService } from '../utils/localStorageService';
import { SELECTORS } from '../utils/selectors';

export class ExpensesView {
    #recentExpensesContainer: HTMLElement;
    #expenceDetailContainer: HTMLElement;
    #participants: HTMLElement;
    #participantPaidByOptions: HTMLElement;

    constructor() {
        this.#recentExpensesContainer = document.querySelector(
            SELECTORS.recentExpensesContainer
        ) as HTMLElement;

        this.#expenceDetailContainer = document.querySelector(
            SELECTORS.expenseDetailContainer
        ) as HTMLElement;

        this.#participants = document.querySelector(
            SELECTORS.participants
        ) as HTMLElement;

        this.#participantPaidByOptions = document.querySelector(
            SELECTORS.paidByInput
        ) as HTMLElement;
    }

    renderExpenses(
        expenses: Array<Expense>,
        attachEventHandlers: () => void
    ): void {
        if (!this.#recentExpensesContainer) return;

        this.#recentExpensesContainer.textContent = '';

        expenses.forEach((expense) => {
            const expenseElement = templates.recentExpenseList(expense);
            this.#recentExpensesContainer.prepend(expenseElement);
        });

        this.handleViewDetailBtn(expenses, attachEventHandlers);
    }

    renderParticipant(name: string): void {
        if (!this.#participants || !this.#participantPaidByOptions) return;

        const participantElement = templates.formParticipants(name);
        this.#participants.appendChild(participantElement);

        const paidByOptionElement = templates.formPaidByOption(name);
        this.#participantPaidByOptions.appendChild(paidByOptionElement);
    }

    handleViewDetailBtn(
        expenses: Array<Expense>,
        attachEventHandlers: () => void
    ) {
        const buttons = document.querySelectorAll(SELECTORS.viewDetailsButtons);

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
        if (!this.#expenceDetailContainer) return;

        this.#expenceDetailContainer.textContent = '';

        const expenseDetailsElement = templates.expenseDetails(expense);
        this.#expenceDetailContainer.appendChild(expenseDetailsElement);

        attachEventHandlers();
    }

    setTheme(toDarkMode: boolean, themeToggleBtn: HTMLButtonElement) {
        const themeToggleIcon = themeToggleBtn.querySelector(
            'img'
        ) as HTMLImageElement;

        if (toDarkMode) {
            document.body.classList.add('dark-mode');
            themeToggleIcon.src = `${new URL('../../assets/icons/light-mode.svg', import.meta.url)}`;
            themeToggleIcon.alt = 'light mode';
            StorageService.saveTheme(true);
        } else {
            document.body.classList.remove('dark-mode');
            themeToggleIcon.src = `${new URL('../../assets/icons/dark-mode.svg', import.meta.url)}`;
            themeToggleIcon.alt = 'dark mode';
            StorageService.saveTheme(false);
        }
    }
}
