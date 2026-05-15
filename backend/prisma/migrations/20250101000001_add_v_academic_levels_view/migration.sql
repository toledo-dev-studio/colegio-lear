-- CreateView
CREATE OR REPLACE VIEW core.v_academic_levels AS
SELECT
  al.id,
  al.name,
  al.description,
  al.status
FROM core.academic_levels al;
