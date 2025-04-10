import type { Expense } from '../model/interfaces';

export const templates = {
    recentExpenseList: (expense: Expense) => {
        return `
            <li>
                <p>${expense.title}</p>
                <p>$${expense.calculatedAmount} (${expense.paidBy.name} paid, split with ${expense.notSettled.map((participant) => participant.name).join(', ')})</p>
                <button class="view-details-button" popovertarget="expense-detail" data-expense-id="${expense.id}">View Details</button>
            </li>
        `;
    },

    expenseDetails: (expense: Expense) => {
        return `
            <p class="expense-detail-title">${expense.title}</p>
            <p class="expense-detail-description">${expense.description}</p>
            <p class="expense-detail-split">$${expense.calculatedAmount} (${expense.paidBy.name} paid, split with ${expense.notSettled.map((participant) => participant.name).join(', ')})</p>
            ${templates.expenseParticipants(expense)}
        `;
    },

    expenseParticipants: (expense: Expense) => {
        return `
            <ul class="expense-detail-participants">
                <li>
                    <P>
                        ${expense.paidBy.name}
                        <span class="to-receive">to receive $${expense.calculatedAmount}</span>
                    </P>
                </li>
                ${expense.notSettled
                    .map(
                        (participant) => `
                        <li>
                            <p>
                                ${participant.name}
                                <span class="to-pay">to pay $${expense.calculatedAmount / expense.notSettled.length}</span>
                            </p>
                            <button data-expense-id="${expense.id}" data-participant-id="${participant.id}" class="expense-paid-btn">Paid</button>
                        </li>
                    `
                    )
                    .join('')}
            </ul>

        `;
    },

    formParticipants: (name: string) => {
        return `
            <span>${name}
                <img
                    src="${new URL('../../assets/icons/close.svg', import.meta.url)}"
                    alt="remove participant"
                    class="remove-participant"
                    role="button"
                />
            </span>
        `;
    },

    formPaidByOption: (name: string) => {
        return `
            <option value="${name}">${name}</option>
        `;
    },
};
