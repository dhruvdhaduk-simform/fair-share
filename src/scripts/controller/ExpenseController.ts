import type { Participant, Expense } from '../model/interfaces.ts';
import { ExpensesView } from '../view/ExpensesView.ts';
import { StorageService } from '../utils/localStorageService.ts';
import { FormService } from '../utils/formService.ts';
import { SELECTORS } from '../utils/selectors.ts';
import { formInputList } from '../utils/formInputList.ts';

export class ExpenseController {
    #participants: Array<Participant>;
    #expenses: Array<Expense>;
    #addExpenseForm: HTMLFormElement;
    #view: ExpensesView;
    #editExpense: Expense | null = null;

    constructor() {
        // Retrive stored participants and expenses from localStorage.
        this.#participants = StorageService.getParticipants();
        this.#expenses = StorageService.getExpenses();

        this.#view = new ExpensesView();

        // Select Add Expense form and attach submit handler.
        this.#addExpenseForm = document.querySelector(
            SELECTORS.addExpenseForm
        ) as HTMLFormElement;

        this.#addExpenseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddExpenseFormSubmit();
        });

        const addButton = document.querySelector(
            SELECTORS.addExpensePopupButton
        ) as HTMLButtonElement;

        addButton.addEventListener('click', () => {
            this.#editExpense = null;
            this.#addExpenseForm.reset();
            this.clearParticipants();
            this.setFormMode(false);
            FormService.clearAllError();

            (
                this.#addExpenseForm.querySelector(
                    SELECTORS.paidByInput
                ) as HTMLSelectElement
            ).disabled = false;
        });

        // Render expenses fetched from localStorage.
        this.#view.renderExpenses(
            this.#expenses,
            this.attachSettlePaymentHandlers.bind(this)
        );

        const formPopup = this.#addExpenseForm.closest('div[popover]');
        if (formPopup instanceof HTMLDivElement) {
            const getValue = (selector: string) =>
                (
                    this.#addExpenseForm.querySelector(
                        selector
                    ) as HTMLInputElement
                )?.value.trim();
            formPopup.addEventListener('toggle', () => {
                const title = getValue(SELECTORS.titleInput);
                const description = getValue(SELECTORS.descriptionInput);
                const amount = Number(getValue(SELECTORS.amountInput));
                const participant = getValue(SELECTORS.participantInput);

                if (!title && !description && !amount && !participant)
                    FormService.clearAllError();
            });
        }

        const addExpenseButton = this.#addExpenseForm.querySelector(
            '.add-expense-btn'
        ) as HTMLButtonElement;

        const observer = new MutationObserver(() => {
            if (FormService.isAnyError()) {
                addExpenseButton.disabled = true;
            } else {
                addExpenseButton.disabled = false;
            }
        });

        observer.observe(this.#addExpenseForm, {
            subtree: true,
            childList: true,
        });

        // Attach Event handlers.
        this.attachThemeChangeHandler();
        this.handleAddParticipant();
        this.attachSettlePaymentHandlers();
        this.attachValidationHandlers();
        this.deleteExpenseHandler();
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

    // Add a new expense.
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

        // Get participants by their names.
        const participants: Array<Participant> = participantNames.map((p) => {
            return this.getParticipant(p);
        });

        const paidBy = this.getParticipant(paidByPersonName);
        const notSettled = participants.filter((p) => p.name !== paidBy.name);
        const calculatedAmount = amount - amount / participants.length;

        // Update the balance of participants according to this expense.
        paidBy.balance += calculatedAmount;
        notSettled.forEach((p) => {
            p.balance -= calculatedAmount / notSettled.length;
        });

        const expense: Expense = {
            id: crypto.randomUUID(),
            title,
            description,
            originalAmount: amount,
            calculatedAmount,
            paidBy,
            settled: [],
            notSettled,
        };

        this.#expenses.push(expense);

        // Update localStorage to include new expense and participants.
        StorageService.saveParticipants(this.#participants);
        StorageService.saveExpenses(this.#expenses);
        // Render expenses with new one added.
        this.#view.renderExpenses(
            this.#expenses,
            this.attachSettlePaymentHandlers.bind(this)
        );

        this.deleteExpenseHandler();
    }

    updateExpense(
        expenseId: string,
        title: string,
        description: string,
        amount: number,
        participantNames: Array<string>,
        paidByPersonName: string
    ) {
        expenseId = expenseId.trim();
        const expense = this.#expenses.find((exp) => exp.id === expenseId);
        if (!expense) {
            throw new Error('Expense with specified ID not found.');
        }

        title = title.trim();
        description = description.trim();
        participantNames = participantNames.map((p) => p.trim());
        paidByPersonName = paidByPersonName.trim();

        // Get participants by their names.
        const participants: Array<Participant> = participantNames.map((p) => {
            return this.getParticipant(p);
        });

        const paidBy = this.getParticipant(paidByPersonName);
        const notSettled = participants.filter((p) => p.name !== paidBy.name);
        const calculatedAmount = amount - amount / participants.length;

        // Update the balance of participants according to this expense.
        paidBy.balance += calculatedAmount;
        notSettled.forEach((p) => {
            p.balance -= calculatedAmount / notSettled.length;
        });

        expense.title = title;
        expense.description = description;
        expense.originalAmount = amount;
        expense.calculatedAmount = calculatedAmount;
        expense.paidBy = paidBy;
        expense.settled = [];
        expense.notSettled = notSettled;

        // Update localStorage to include new expense and participants.
        StorageService.saveParticipants(this.#participants);
        StorageService.saveExpenses(this.#expenses);
        // Render expenses with new one added.
        this.#view.renderExpenses(
            this.#expenses,
            this.attachSettlePaymentHandlers.bind(this)
        );

        this.deleteExpenseHandler();
    }

    deleteExpense(expenseId: string) {
        expenseId = expenseId.trim();
        this.#expenses = this.#expenses.filter((exp) => exp.id !== expenseId);
        StorageService.saveExpenses(this.#expenses);

        this.#view.renderExpenses(
            this.#expenses,
            this.attachSettlePaymentHandlers.bind(this)
        );

        this.deleteExpenseHandler();
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
        const amountPaid = expense.calculatedAmount / expense.notSettled.length;

        // Update the expense and balance of participants.
        expense.notSettled.splice(participantIndex, 1);
        expense.settled.push(participant);
        expense.calculatedAmount -= amountPaid;
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

        this.deleteExpenseHandler();

        // Update localStorage to include new expense and participants.
        StorageService.saveExpenses(this.#expenses);
        StorageService.saveParticipants(this.#participants);
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

        // Get the values from inputs.
        const title = getValue(SELECTORS.titleInput);
        const description = getValue(SELECTORS.descriptionInput);
        const amount = Number(getValue(SELECTORS.amountInput));
        const paidByPersonName = getValue(SELECTORS.paidByInput);

        // Validate all values from inputs.
        const titleError = FormService.validateTitle(title);
        const descriptionError = FormService.validateDescription(description);
        const amountError = FormService.validateAmount(amount);

        // Prevent form submission if there is invalid input.
        if (titleError || descriptionError || amountError) return;

        // Parse all the participant names as a string array.
        const participantNames: Array<string> = Array.from(
            this.#addExpenseForm.querySelector(SELECTORS.participants)
                ?.children ?? []
        )
            .map((item) => {
                return item.textContent?.trim();
            })
            .filter((participant) => typeof participant === 'string');

        try {
            if (this.#editExpense == null) {
                this.addNewExpense(
                    title,
                    description,
                    amount,
                    participantNames,
                    paidByPersonName
                );
            } else {
                this.updateExpense(
                    this.#editExpense.id,
                    title,
                    description,
                    amount,
                    participantNames,
                    paidByPersonName
                );
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                alert(err.message);
                console.error(err.message);
            } else {
                console.error(err);
            }

            return;
        }

        // Clear the form
        this.#addExpenseForm.reset();
        this.clearParticipants();

        // Close the popup after submission.
        const popup = this.#addExpenseForm.closest('div[popover]');
        if (popup instanceof HTMLDivElement) {
            popup.hidePopover();
        }
        if (this.#editExpense) {
            this.#view.renderExpenseDetails(
                this.#editExpense,
                this.attachSettlePaymentHandlers.bind(this)
            );
        }

        FormService.clearError('participant');
    }

    // Attach event handler to theme toggle button.
    attachThemeChangeHandler() {
        // Select the theme toggle button.
        const themeToggleBtn = document.querySelector(
            SELECTORS.themeToggleButton
        ) as HTMLButtonElement;

        // Get the previously stored theme from localStorage.
        this.#view.setTheme(StorageService.isDarkMode(), themeToggleBtn);

        // Click handler to toggle theme.
        themeToggleBtn.addEventListener('click', () => {
            if (document.body.classList.contains('dark-mode')) {
                this.#view.setTheme(false, themeToggleBtn);
            } else {
                this.#view.setTheme(true, themeToggleBtn);
            }
        });
    }

    addParticipant(participantName?: string) {
        const participantInput = this.#addExpenseForm.querySelector(
            SELECTORS.participantInput
        ) as HTMLInputElement;

        const participantContainer = this.#addExpenseForm.querySelector(
            SELECTORS.participants
        ) as HTMLElement;

        if (participantContainer.childElementCount > 7) {
            return;
        }

        if (participantName !== undefined) {
            const participantError =
                FormService.validateParticipant(participantName);

            if (participantError) return;

            FormService.clearError('participant');

            this.#view.renderParticipant(participantName);

            participantInput.value = '';

            if (participantContainer.childElementCount < 2) {
                FormService.showError(
                    'participant',
                    'add minimum two participants'
                );
            }
        }

        Array.from(participantContainer?.children ?? []).forEach((item) => {
            // For each participant in participants list.

            const name = item.textContent?.trim() ?? '';
            const removeParticipantIcon = item.querySelector(
                'img'
            ) as HTMLImageElement;
            if (
                this.#editExpense &&
                (participantContainer.childElementCount <= 2 ||
                    this.#editExpense?.paidBy.name === name)
            ) {
                removeParticipantIcon.style.display = 'none';
            } else {
                removeParticipantIcon.style.display = 'block';
                removeParticipantIcon?.addEventListener('click', () => {
                    item.remove();
                    this.#addExpenseForm
                        .querySelector(SELECTORS.paidByOption(name))
                        ?.remove();
                    if (participantContainer.childElementCount < 2) {
                        FormService.showError(
                            'participant',
                            'add minimum two participants'
                        );
                    }

                    if (
                        participantContainer.childElementCount <= 2 &&
                        !(this.#editExpense === null)
                    ) {
                        Array.from(
                            participantContainer?.children ?? []
                        ).forEach((item) => {
                            (
                                item.querySelector('img') as HTMLImageElement
                            ).style.display = 'none';
                        });
                    }
                });
            }
        });

        participantInput.focus();
    }

    // Attach event handler to Add Participant button in Add Expense form.
    handleAddParticipant() {
        const addParticipantBtn = this.#addExpenseForm.querySelector(
            SELECTORS.addParticipantButton
        ) as HTMLButtonElement;

        const participantInput = this.#addExpenseForm.querySelector(
            SELECTORS.participantInput
        ) as HTMLInputElement;

        const addParticipantButton = this.#addExpenseForm.querySelector(
            SELECTORS.addParticipantButton
        ) as HTMLButtonElement;

        addParticipantBtn.addEventListener('click', () => {
            this.addParticipant(participantInput.value);
            addParticipantButton.disabled = true;
        });
        participantInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addParticipant(participantInput.value);
                addParticipantBtn.disabled = true;
            }
        });
    }

    // Utility function to clear all the participants from the form after submission.
    clearParticipants() {
        // Clear all the participants from the list.
        const participants = this.#addExpenseForm.querySelector(
            SELECTORS.participants
        ) as HTMLElement;
        participants.innerHTML = '';

        // Clear all the participants from Paid By options.
        const participantOptions = this.#addExpenseForm.querySelector(
            SELECTORS.paidByInput
        ) as HTMLElement;
        participantOptions.innerHTML = `<option value="" disabled selected> select participant </option>`;
    }

    deleteExpenseHandler() {
        const deleteButton = document.querySelectorAll(
            '.expense-delete-button'
        ) as NodeListOf<HTMLButtonElement>;

        deleteButton.forEach((button) => {
            button.addEventListener('click', () => {
                const expenseId = button.dataset.expenseId;
                if (typeof expenseId === 'string') {
                    this.deleteExpense(expenseId);
                }
            });
        });
    }

    // Attach event handler to 'Paid' buttons for settling payments.
    attachSettlePaymentHandlers() {
        const expenceDetailContainer = document.querySelector(
            SELECTORS.expenseDetailContainer
        ) as HTMLElement;

        const editButton = expenceDetailContainer.querySelector(
            SELECTORS.expenseEditButton
        ) as HTMLButtonElement;

        expenceDetailContainer
            .querySelectorAll(SELECTORS.expensePaidButtons)
            .forEach((paidBtn) => {
                if (!(paidBtn instanceof HTMLButtonElement)) return;
                paidBtn.addEventListener('click', () => {
                    const expenseId = paidBtn.dataset.expenseId;
                    const participantId = paidBtn.dataset.participantId;
                    if (!expenseId || !participantId) return;
                    this.settle(expenseId, participantId);
                });
            });

        editButton?.addEventListener('click', () => {
            const setValue = (selector: string, value: string | number) => {
                (
                    this.#addExpenseForm.querySelector(
                        selector
                    ) as HTMLInputElement
                ).value = String(value);
            };

            (
                this.#addExpenseForm.querySelector(
                    SELECTORS.paidByInput
                ) as HTMLSelectElement
            ).disabled = true;

            const expenseId = editButton.dataset.expenseId?.trim();
            const expense = this.#expenses.find((exp) => exp.id === expenseId);
            if (!expense) {
                throw new Error('Expense with specified ID not found.');
            }

            this.clearParticipants();

            setValue(SELECTORS.titleInput, expense.title);
            setValue(SELECTORS.descriptionInput, expense.description);
            setValue(SELECTORS.amountInput, expense.originalAmount);
            setValue(SELECTORS.paidByInput, expense.paidBy.name);

            this.addParticipant(expense.paidBy.name);

            expense.notSettled.forEach((participant) => {
                this.addParticipant(participant.name);
            });

            this.#editExpense = expense;

            this.setFormMode(true);
            this.addParticipant();
        });
    }

    // Attach inline validation handlers to all form inputs.
    attachValidationHandlers() {
        // Utility function to attach inline validation handler for a specified input field.
        const handleInput = (
            inputSelector: string,
            validator: (value: string) => string,
            errorType: string,
            limitValidator?: () => string
        ) => {
            const inputElement = this.#addExpenseForm.querySelector(
                inputSelector
            ) as HTMLInputElement;
            inputElement.addEventListener('input', (e) => {
                const value =
                    e.target instanceof HTMLInputElement ? e.target.value : '';
                let errorMessage: string;
                errorMessage = validator(value);
                if (limitValidator) {
                    const limitError = limitValidator();
                    if (limitError) {
                        errorMessage = limitError;
                        (e.target as HTMLInputElement).value = '';
                    }
                }
                if (errorMessage) {
                    FormService.showError(errorType, errorMessage);
                } else {
                    FormService.clearError(errorType);
                }
            });
        };

        formInputList.forEach((inputItem) => {
            handleInput(
                inputItem.inputSelector,
                inputItem.validator,
                inputItem.errorType
            );
        });

        const participantInput = this.#addExpenseForm.querySelector(
            SELECTORS.participantInput
        ) as HTMLInputElement;

        const participantAddButton = this.#addExpenseForm.querySelector(
            SELECTORS.addParticipantButton
        ) as HTMLButtonElement;

        participantInput.addEventListener('input', (e) => {
            const value =
                e.target instanceof HTMLInputElement ? e.target.value : '';
            let errorMessage: string = FormService.validateParticipant(value);
            const participantContainer = this.#addExpenseForm.querySelector(
                SELECTORS.participants
            ) as HTMLElement;

            if (value == '') {
                if (participantContainer.childElementCount < 2) {
                    FormService.showError(
                        'participant',
                        'add minimum tow participant'
                    );
                } else {
                    FormService.clearError('participant');
                }
                participantAddButton.disabled = true;
                return;
            }

            if (participantContainer.childElementCount > 7) {
                errorMessage = 'You can add only 8 participants.';
            }

            if (errorMessage) {
                FormService.showError('participant', errorMessage);
                participantAddButton.disabled = true;
            } else {
                FormService.clearError('participant');
                participantAddButton.disabled = false;
            }
        });
    }

    setFormMode(isEditMode: boolean) {
        if (isEditMode) {
            (
                document.querySelector(SELECTORS.formHeading) as HTMLElement
            ).textContent = 'Update Expense';

            (
                document.querySelector(
                    SELECTORS.formSubmitButton
                ) as HTMLButtonElement
            ).textContent = 'Update Expense';
        } else {
            (
                document.querySelector(SELECTORS.formHeading) as HTMLElement
            ).textContent = 'Add New Expense';

            (
                document.querySelector(
                    SELECTORS.formSubmitButton
                ) as HTMLButtonElement
            ).textContent = 'Add Expense';
        }
    }
}
