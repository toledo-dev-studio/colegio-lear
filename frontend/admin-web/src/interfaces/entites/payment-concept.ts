export interface PaymentConcept {
    id: string;
    name: string;
    description: string;
    allowForgiveness: boolean;
    amount: number;
    status: boolean;
}
