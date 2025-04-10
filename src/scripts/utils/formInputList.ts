import { FormService } from './formService.ts';
import { SELECTORS } from './selectors.ts';

export const formInputList = [
    {
        inputSelector: SELECTORS.titleInput,
        validator: FormService.validateTitle.bind(FormService),
        errorType: 'title',
    },
    {
        inputSelector: SELECTORS.descriptionInput,
        validator: FormService.validateDescription.bind(FormService),
        errorType: 'description',
    },
    {
        inputSelector: SELECTORS.amountInput,
        validator: FormService.validateAmount.bind(FormService),
        errorType: 'amount',
    },
    {
        inputSelector: SELECTORS.participantInput,
        validator: FormService.validateParticipant.bind(FormService),
        errorType: 'participant',
    },
];
