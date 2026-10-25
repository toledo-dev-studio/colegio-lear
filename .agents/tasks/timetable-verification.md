# Timetable verification (static, DB not contacted)

## Commands run
- Throwaway script (expanded buildTimetable(), assertNoConflicts with teacher map Espanol/Expresion per group, other subjects per single teacher; deleted afterwards). Exit 0, output:

~~~
PASS no group/teacher overlap, start<end
PASS unique ids
PASS total 90 slots
PASS primaria_a espanol 5x 08-09
PASS primaria_a within 08:00-14:00
PASS primaria_a 25 classes

primaria_a
  monday    08:00-09:00 espanol | 09:00-10:00 matematicas | 10:00-11:00 ciencias | 11:30-12:30 ingles | 12:30-13:30 educacion_fisica
  tuesday   08:00-09:00 espanol | 09:00-10:00 matematicas | 10:00-11:00 historia | 11:30-12:30 educacion_artistica | 12:30-13:30 computacion
  wednesday 08:00-09:00 espanol | 09:00-10:00 matematicas | 10:00-11:00 ingles | 11:30-12:30 ciencias | 12:30-13:30 formacion_civica
  thursday  08:00-09:00 espanol | 09:00-10:00 matematicas | 10:00-11:00 educacion_artistica | 11:30-12:30 computacion | 12:30-13:30 historia
  friday    08:00-09:00 espanol | 09:00-10:00 ciencias | 10:00-11:00 ingles | 11:30-12:30 educacion_fisica | 12:30-13:30 geografia
  weekly: {"espanol_1p":5,"matematicas_1p":4,"ciencias_1p":3,"ingles_1p":3,"educacion_fisica_1p":2,"historia_1p":2,"educacion_artistica_1p":2,"computacion_1p":2,"formacion_civica_1p":1,"geografia_1p":1}
PASS primaria_b espanol 5x 08-09
PASS primaria_b within 08:00-14:00
PASS primaria_b 25 classes

primaria_b
  monday    08:00-09:00 espanol | 09:00-10:00 ciencias | 10:00-11:00 ingles | 11:30-12:30 educacion_fisica | 12:30-13:30 matematicas
  tuesday   08:00-09:00 espanol | 09:00-10:00 historia | 10:00-11:00 educacion_artistica | 11:30-12:30 computacion | 12:30-13:30 matematicas
  wednesday 08:00-09:00 espanol | 09:00-10:00 ingles | 10:00-11:00 ciencias | 11:30-12:30 formacion_civica | 12:30-13:30 matematicas
  thursday  08:00-09:00 espanol | 09:00-10:00 educacion_artistica | 10:00-11:00 computacion | 11:30-12:30 historia | 12:30-13:30 matematicas
  friday    08:00-09:00 espanol | 09:00-10:00 ingles | 10:00-11:00 educacion_fisica | 11:30-12:30 geografia | 12:30-13:30 ciencias
  weekly: {"espanol_1p":5,"ciencias_1p":3,"ingles_1p":3,"educacion_fisica_1p":2,"matematicas_1p":4,"historia_1p":2,"educacion_artistica_1p":2,"computacion_1p":2,"formacion_civica_1p":1,"geografia_1p":1}
PASS preescolar_a espanol 5x 08-09
PASS preescolar_a within 08:00-14:00
PASS preescolar_a 20 classes

preescolar_a
  monday    08:00-09:00 espanol | 09:00-10:00 matematicas | 10:30-11:30 exploracion | 11:30-12:30 musica
  tuesday   08:00-09:00 espanol | 09:00-10:00 ingles | 10:30-11:30 psicomotricidad | 11:30-12:30 expresion
  wednesday 08:00-09:00 espanol | 09:00-10:00 matematicas | 10:30-11:30 convivencia | 11:30-12:30 exploracion
  thursday  08:00-09:00 espanol | 09:00-10:00 expresion | 10:30-11:30 ingles | 11:30-12:30 psicomotricidad
  friday    08:00-09:00 espanol | 09:00-10:00 matematicas | 10:30-11:30 musica | 11:30-12:30 convivencia
  weekly: {"espanol_1pe":5,"matematicas_1pe":3,"exploracion_1pe":2,"musica_1pe":2,"ingles_1pe":2,"psicomotricidad_1pe":2,"expresion_1pe":2,"convivencia_1pe":2}
PASS preescolar_b espanol 5x 08-09
PASS preescolar_b within 08:00-14:00
PASS preescolar_b 20 classes

preescolar_b
  monday    08:00-09:00 espanol | 09:00-10:00 exploracion | 10:30-11:30 musica | 11:30-12:30 matematicas
  tuesday   08:00-09:00 espanol | 09:00-10:00 psicomotricidad | 10:30-11:30 expresion | 11:30-12:30 ingles
  wednesday 08:00-09:00 espanol | 09:00-10:00 convivencia | 10:30-11:30 exploracion | 11:30-12:30 matematicas
  thursday  08:00-09:00 espanol | 09:00-10:00 ingles | 10:30-11:30 psicomotricidad | 11:30-12:30 expresion
  friday    08:00-09:00 espanol | 09:00-10:00 musica | 10:30-11:30 convivencia | 11:30-12:30 matematicas
  weekly: {"espanol_1pe":5,"exploracion_1pe":2,"musica_1pe":2,"matematicas_1pe":3,"psicomotricidad_1pe":2,"expresion_1pe":2,"ingles_1pe":2,"convivencia_1pe":2}
PASS negative: clash detected
~~~

- tsc with temp config including prisma/seed.ts + prisma/seed-timetable.ts + src: exit 0 (temp config deleted).
- `npx tsc --noEmit` in backend: exit 0.

## Notes
- 90 entries, ids ee000000-0021-4000-8000-<n>. Old ids ...0011...001-032 are deleted (deleteMany) before upsert; upsert now overwrites fields (idempotent).
- Recess is a gap (11:00-11:30 primaria, 10:00-10:30 preescolar); model needs subject+teacher.
- Added subjects geografia_1p/computacion_1p and 4 teachers (Espanol for B groups, Geografia, Computacion). No schema/migration/credential/storage changes. No commit.

