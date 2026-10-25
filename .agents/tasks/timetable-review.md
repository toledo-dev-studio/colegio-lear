# Horario semanal completo generado desde una definición compacta en el seed

El seed pasa de 32 clases sueltas (una por día) a 90 entradas de calendario generadas en un bucle a partir de rejillas tipadas en el nuevo `seed-timetable.ts`. Español queda de 8:00 a 9:00 los cinco días en cada grupo, primaria tiene 25 h/semana (5 periodos/día, 8:00-13:30), preescolar 20 h/semana (4 periodos/día, 8:00-12:30). Se agregan 2 materias (Geografía, Computación) y 4 docentes (Español para los grupos B, Geografía, Computación). Los ids viejos `ee000000-0011-…001..032` se borran y los nuevos usan el prefijo `0021`.

Watch for: (1) `seed-timetable.test.ts`, prometido en el plan, no existe; la cobertura descansa en un script desechable (confirmed). (2) El diff de `git diff` incluye cambios en archivos de auth ajenos a esta tarea; no pertenecen a este cambio del seed (confirmed, fuera de alcance).

**Verdict**: APPROVED

## High-level view

Las rejillas de Grupo A (periodos 2..n) son datos compactos; el Grupo B es la rotación a la izquierda de A por día, y el periodo 1 es Español fijo. Esto evita que un docente compartido esté en dos grupos a la vez. Como Español sincroniza a las 8:00 para A y B, se crea un segundo docente de Español por nivel.

`assertNoConflicts` corre antes de cualquier escritura a la DB y lanza si hay traslape de grupo o de docente, porque el esquema no tiene restricciones de traslape. La nota de verificación registra PASS en traslapes, 90 entradas, ids únicos, Español 5x 8-9, ventana 8-14 y conteos de 25/20 clases.

La idempotencia se resuelve con ids fijos nuevos, `deleteMany` solo de los 32 ids heredados (las filas manuales del admin se conservan) y `upsert` con `update: fields`, que converge al re-ejecutar.

<details>
<summary>Issues (2)</summary>

1. **Falta el test unitario (non-blocking, confirmed)** — `backend/prisma/seed-timetable.test.ts` del plan no existe; la verificación fue un script desechable. Conviene agregarlo para que las invariantes queden protegidas.
2. **Comentario mal ubicado (non-blocking, confirmed)** — en `EXTRA_TEACHERS_2026` el comentario sobre los docentes de Español queda encima de Geografía/Computación, no de las filas de Español. Moverlo.

</details>

<details>
<summary>Details</summary>

## Reconciliación de los slots 19-32 y de los ids heredados

Los 32 ids anteriores llevan horas distintas (10-11, 11-12 para el segundo slot). Reutilizarlos con `update: {}` habría dejado filas viejas traslapadas con la nueva rejilla. El seed borra exactamente esos 32 ids antes de insertar, así que no hay duplicados ni conflictos con los slots 19-32. Ninguna otra tabla referencia ids de calendario (tareas, materiales y chat apuntan a grupo y materia del ciclo), por lo que el borrado es seguro. Limitación aceptada en el plan: el seed no detecta un calendario manual del admin que se traslape con el nuevo.

## Separación de docentes de Español

Laura Fernández y Claudia Bravo pasan a solo el grupo A; Sofía Carrillo y Lucía Montoya cubren B. Se añadieron al final de `EXTRA_TEACHERS_2026`, con lo que los correos e índices existentes no cambian. Los demás docentes comparten A y B, y la rotación garantiza que nunca coincidan en la misma celda. Efecto a mencionar: Español de B cambia de docente en bases ya sembradas, y los mensajes de bienvenida del chat para docentes nuevos solo aparecen en base limpia (limitación documentada en el plan).

## Alcance

En el diff de `seed.ts` solo cambian constantes de materias, docentes, bloque de horario y nombres de display. `schema.prisma`, migraciones, credenciales y bloques de carga a storage no se tocan. El orden de `PRIMARIA_SUBJECT_KEYS`/`PREESCOLAR_SUBJECT_KEYS` se mantiene (los nuevos van al final), de modo que el índice usado en las calificaciones no se altera. El log de cuentas ahora reporta 90 entradas y las heredadas eliminadas. Los otros archivos modificados en el working tree (auth controllers, middleware, env.config) no forman parte de este cambio.

## Limitación del modelo

El receso no se puede representar porque cada fila exige materia y docente; queda como hueco de 30 min. Es coherente con la intención del usuario (horario lleno de 8 a 13-14 h).

</details>

<details>
<summary>File map</summary>

- `backend/prisma/seed.ts`: materias y docentes nuevos, bloque de horario reemplazado por generación programática, deleteMany legado y upsert con overwrite.
- `backend/prisma/seed-timetable.ts` (nuevo): rejillas, periodos, `buildTimetable`, `assertNoConflicts`, ids.

Diff completo: `git diff -- backend/prisma/seed.ts` más el archivo nuevo sin seguimiento.

</details>
