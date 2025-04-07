import type { Expense } from '../model/interfaces';

export const templates = {
    recentExpenseList: (expense: Expense) => {
        return `
            <li>
                <p>${expense.title}</p>
                <p>$${expense.amount} (${expense.paidBy.name} paid, split with ${expense.notSettled.map((participant) => participant.name).join(', ')})</p>
                <button class="view-details-button" popovertarget="expense-detail" data-expense-id="${expense.id}">View Details</button>
            </li>
        `;
    },

    expenseDetails: (expense: Expense) => {
        return `
            <p class="expense-detail-title">${expense.title}</p>
            <p class="expense-detail-description">${expense.description}</p>
            <p class="expense-detail-split">$${expense.amount} (${expense.paidBy.name} paid, split with ${expense.notSettled.map((participant) => participant.name).join(', ')})</p>
            ${templates.expenseParticipants(expense)}
        `;
    },

    expenseParticipants: (expense: Expense) => {
        return `
            <ul class="expense-detail-participants">
                <li>
                    <P>
                        ${expense.paidBy.name}
                        <span class="to-receive">to receive $${expense.amount}</span>
                    </P>
                </li>
                ${expense.notSettled
                    .map(
                        (participant) => `
                        <li>
                            <p>
                                ${participant.name}
                                <span class="to-pay">to gets $${expense.amount / expense.notSettled.length}</span>
                            </p>
                            <button class="expense-paid-btn">Paid</button>
                        </li>
                    `
                    )
                    .join('')}
            </ul>

        `;
    },
};
