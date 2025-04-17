export class FormService {
    static validateTitle(title: string): string {
        title = title.trim();
        if (!title) return 'Please provide a title.';
        if (!/^[A-Za-z\s]+[A-Za-z0-9\s]*$/.test(title)) {
            return 'Title contains invalid characters. Only letters, numbers, and spaces allowed, starting with a letter.';
        }
        if (title.length > 30) return 'Title must not exceed 30 characters.';
        return '';
    }

    static validateDescription(description: string): string {
        description = description.trim();
        if (!description) return 'Please provide a description.';
        if (!/^[A-Za-z\s]+[A-Za-z0-9\s]*$/.test(description)) {
            return 'Description contains invalid characters. Only letters, numbers, and spaces allowed, starting with a letter.';
        }
        if (description.length > 200)
            return 'Description must not exceed 200 characters.';
        return '';
    }

    static validateAmount(amount: string | number): string {
        if (typeof amount === 'string') {
            amount = amount.trim();
        }
        const amountNum = Number(amount);
        if (isNaN(amountNum) || amountNum <= 0)
            return 'Please provide a valid price greater than 0.';
        if (amountNum > 100000) return 'Price must not exceed 1,00,000.';
        return '';
    }

    static validateParticipant(participant: string): string {
        participant = participant.trim();
        if (!participant) return 'Please provide a participant name';
        if (participant.length > 20)
            return 'Participant name must not exceed 20 characters.';
        if (!/^[a-zA-Z]+$/.test(participant))
            return 'Participant name must only contain letters (a-z, A-Z).';
        return '';
    }

    static showError(inputId: string, message: string): void {
        const errorElement = document.getElementById(
            `${inputId}Error`
        ) as HTMLElement;
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    static clearError(inputId: string): void {
        const errorElement = document.getElementById(
            `${inputId}Error`
        ) as HTMLElement;
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    static clearAllError() {
        this.clearError('title');
        this.clearError('description');
        this.clearError('amount');
        this.clearError('participant');
    }
}
