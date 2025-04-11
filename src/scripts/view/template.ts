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
            amount.innerHTML = templates.expenseSplitDisplay(expense);
            listItem.appendChild(amount);
        }

        const buttonController = document.createElement('div');
        buttonController.classList.add('button-controller');
        listItem.appendChild(buttonController);

        const viewDetailsButton = document.createElement('button');
        viewDetailsButton.classList.add('view-details-button');
        viewDetailsButton.setAttribute('data-expense-id', expense.id);
        viewDetailsButton.setAttribute('popovertarget', 'expense-detail');
        viewDetailsButton.textContent = 'View Details';
        buttonController.appendChild(viewDetailsButton);

        const deleteButtonIcon = document.createElement('img');
        deleteButtonIcon.src = `${new URL('../../assets/icons/delete.svg', import.meta.url)}`;
        deleteButtonIcon.alt = 'delete icon';
        deleteButtonIcon.classList.add('delete-button-icon');

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('expense-delete-button');
        deleteButton.setAttribute('data-expense-id', expense.id);
        deleteButton.appendChild(deleteButtonIcon);

        buttonController.appendChild(deleteButton);

        return listItem;
    },

    expenseSplitDisplay: (expense: Expense) => {
        return `&#x20b9;${expense.originalAmount} (${expense.paidBy.name} paid, split with ${expense.notSettled.map((participant) => participant.name).join(', ')}, ${expense.settled.map((participant) => participant.name).join(', ')})`;
    },

    expenseDetails: (expense: Expense): HTMLElement => {
        const container = document.createElement('div');

        const title = document.createElement('p');
        title.classList.add('expense-detail-title');
        title.textContent = expense.title;

        const closeIcon = document.createElement('img');
        closeIcon.src = `${new URL('../../assets/icons/close.svg', import.meta.url)}`;
        closeIcon.alt = 'close icon';

        const closeButton = document.createElement('button');
        closeButton.setAttribute('popovertarget', 'expense-detail');
        closeButton.classList.add('view-detail-close-button');
        closeButton.appendChild(closeIcon);

        const titleDiv = document.createElement('div');
        titleDiv.classList.add('view-detail-title-div');

        titleDiv.appendChild(title);
        titleDiv.appendChild(closeButton);
        container.appendChild(titleDiv);

        const description = document.createElement('p');
        description.classList.add('expense-detail-description');
        description.textContent = expense.description;
        container.appendChild(description);

        const splitAmount = document.createElement('p');
        splitAmount.classList.add('expense-detail-split');
        splitAmount.innerHTML = templates.expenseSplitDisplay(expense);
        container.appendChild(splitAmount);

        const participants = templates.expenseParticipants(expense);
        container.appendChild(participants);

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('edit-button');
        editButton.dataset.expenseId = expense.id;
        editButton.setAttribute('popovertarget', 'form-container');

        if (expense.settled.length == 0) {
            container.appendChild(editButton);
        }

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
