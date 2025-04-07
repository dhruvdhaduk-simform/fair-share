import type { Expense } from '../model/interfaces';
import { templates } from './template';

export class ExpensesView {
    #recentExpensesContainer: HTMLElement;
    #expenceDetailContainer: HTMLElement;

    constructor() {
        this.#recentExpensesContainer = document.querySelector(
            '.recent-expenses'
        ) as HTMLElement;

        this.#expenceDetailContainer = document.querySelector(
            '.expense-detail'
        ) as HTMLElement;
    }

    renderExpenses(expenses: Array<Expense>): void {
        if (!this.#recentExpensesContainer) return;

        this.#recentExpensesContainer.innerHTML = expenses
            .map(templates.recentExpenseList)
            .join('');

        this.handleViewDetailBtn(expenses);
    }

    handleViewDetailBtn(expenses: Array<Expense>) {
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
                    this.#expenceDetailContainer.innerHTML =
                        templates.expenseDetails(selectedExpense);
                }
            });
        });
    }
}
