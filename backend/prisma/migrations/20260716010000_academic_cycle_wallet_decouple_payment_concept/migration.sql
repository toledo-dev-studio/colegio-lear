-- academic_cycle_wallet.payment_concept_id was a required FK to payment_concepts,
-- but the frontend only ever uses the payment concept as an autofill template
-- (never sends paymentConceptId back) and edits name/amount/description freely
-- afterwards. Decouple: add own name/description columns, backfill from the
-- related payment concept, then drop the FK column.

ALTER TABLE core.academic_cycle_wallet ADD COLUMN name VARCHAR(100);
ALTER TABLE core.academic_cycle_wallet ADD COLUMN description VARCHAR(500);

UPDATE core.academic_cycle_wallet w
SET name = pc.name,
    description = pc.description
FROM core.payment_concepts pc
WHERE w.payment_concept_id = pc.id;

ALTER TABLE core.academic_cycle_wallet ALTER COLUMN name SET NOT NULL;

ALTER TABLE core.academic_cycle_wallet DROP CONSTRAINT IF EXISTS academic_cycle_wallet_payment_concept_id_fkey;
ALTER TABLE core.academic_cycle_wallet DROP COLUMN payment_concept_id;
