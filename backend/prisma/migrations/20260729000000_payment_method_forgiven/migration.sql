-- Forgiving a wallet item now gets a real entry in its payment history
-- (StudentWalletService.updateItem), instead of just zeroing
-- outstandingAmount silently with no audit trail.
ALTER TYPE "core"."PaymentMethod" ADD VALUE 'forgiven';
