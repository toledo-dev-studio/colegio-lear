-- Rename column image → avatar in employees and students tables
ALTER TABLE core.employees RENAME COLUMN image TO avatar;
ALTER TABLE core.students RENAME COLUMN image TO avatar;
