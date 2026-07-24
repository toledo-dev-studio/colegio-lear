-- The frontend never had/used a "description" field for academic cycles —
-- drop the unused column.
ALTER TABLE core.academic_cycles DROP COLUMN description;
