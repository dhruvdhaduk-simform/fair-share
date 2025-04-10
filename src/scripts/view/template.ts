import { Expense } from '../model/interfaces';

export const templates = {
    recentExpenseList: (expense: Expense): HTMLElement => {
        const listItem = document.createElement('li');

        const title = document.createElement('p');
        title.textContent = expense.title;

        listItem.appendChild(title);

        if (expense.calculatedAmount === 0) {
            const message = document.createElement('p');
            message.classList.add('payment-settle-message');
            message.textContent = 'This expense has been successfully resolved';
            listItem.appendChild(message);
        } else {
            const amount = document.createElement('p');
            amount.innerHTML = `&#x20b9;${expense.originalAmount} (${expense.paidBy.name} paid, split with ${expense.notSettled.map((participant) => participant.name).join(', ')})`;
            listItem.appendChild(amount);
        }

        const viewDetailsButton = document.createElement('button');
        viewDetailsButton.classList.add('view-details-button');
        viewDetailsButton.setAttribute('data-expense-id', expense.id);
        viewDetailsButton.setAttribute('popovertarget', 'expense-detail');
        viewDetailsButton.textContent = 'View Details';
        listItem.appendChild(viewDetailsButton);

        return listItem;
    },

    expenseDetails: (expense: Expense): HTMLElement => {
        const container = document.createElement('div');

        const title = document.createElement('p');
        title.classList.add('expense-detail-title');
        title.textContent = expense.title;
        container.appendChild(title);

        const description = document.createElement('p');
        description.classList.add('expense-detail-description');
        description.textContent = expense.description;
        container.appendChild(description);

        const splitAmount = document.createElement('p');
        splitAmount.classList.add('expense-detail-split');
        if (expense.calculatedAmount === 0) {
            splitAmount.innerHTML = `&#x20b9;${expense.originalAmount} (${expense.paidBy.name} paid, split with ${expense.settled.map((participant) => participant.name).join(', ')})`;
        } else {
            splitAmount.innerHTML = `&#x20b9;${expense.originalAmount} (${expense.paidBy.name} paid, split with ${expense.notSettled.map((participant) => participant.name).join(', ')})`;
        }
        container.appendChild(splitAmount);

        const participants = templates.expenseParticipants(expense);
        container.appendChild(participants);

        return container;
    },

    expenseParticipants: (expense: Expense): HTMLElement => {
        const participantsList = document.createElement('ul');
        participantsList.classList.add('expense-detail-participants');

        const paidByItem = document.createElement('li');
        const paidByText = document.createElement('p');
        paidByText.innerHTML = `${expense.paidBy.name} <span class="to-receive">to receive &#x20b9;${expense.calculatedAmount.toFixed(2)}</span>`;
        paidByItem.appendChild(paidByText);
        participantsList.appendChild(paidByItem);

        expense.notSettled.forEach((participant) => {
            const participantItem = document.createElement('li');
            const participantText = document.createElement('p');
            participantText.innerHTML = `${participant.name} <span class="to-pay">to pay &#x20b9;${(expense.calculatedAmount / expense.notSettled.length).toFixed(2)}</span>`;
            participantItem.appendChild(participantText);

            const paidButton = document.createElement('button');
            paidButton.classList.add('expense-paid-btn');
            paidButton.setAttribute('data-expense-id', expense.id);
            paidButton.setAttribute('data-participant-id', participant.id);
            paidButton.textContent = 'Paid';
            participantItem.appendChild(paidButton);

            participantsList.appendChild(participantItem);
        });

        expense.settled.forEach((participant) => {
            const participantItem = document.createElement('li');
            const participantText = document.createElement('p');
            participantText.classList.add('paid-list');
            participantText.innerHTML = `${participant.name} <span class="paid">paid &#x20b9;${(expense.originalAmount / (expense.notSettled.length + expense.settled.length + 1)).toFixed(2)}</span>`;
            participantItem.appendChild(participantText);
            participantsList.appendChild(participantItem);
        });

        return participantsList;
    },

    formParticipants: (name: string): HTMLElement => {
        const participantSpan = document.createElement('span');
        participantSpan.textContent = name;

        const closeIcon = document.createElement('img');
        closeIcon.setAttribute(
            'src',
            new URL('../../assets/icons/close.svg', import.meta.url).toString()
        );
        closeIcon.setAttribute('alt', 'remove participant');
        closeIcon.classList.add('remove-participant');
        closeIcon.setAttribute('role', 'button');
        participantSpan.appendChild(closeIcon);

        return participantSpan;
    },

    formPaidByOption: (name: string): HTMLOptionElement => {
        const option = document.createElement('option');
        option.setAttribute('value', name);
        option.textContent = name;
        return option;
    },
};
