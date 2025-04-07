/**
 * [TEMPORARY]
 * This is for temporary snippet for testing purpose only.
 * It allows reviewers to test the Controller logic from console, because UI has not benn implemented yet.
 */
import { ExpenseController } from './controller/ExpenseController.ts';
declare global {
    interface Window {
        e: ExpenseController;
    }
}
window.e = new ExpenseController();

const greet: string = 'Hello World from TypeScript';

console.log(greet);
