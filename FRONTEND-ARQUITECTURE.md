# Arquitectura base para proyectos React + Vite + TypeScript

## 1. Propósito

Esta guía define una arquitectura base reutilizable y escalable para proyectos frontend basados en React, TypeScript, Vite y Tailwind. Está pensada para ser utilizada como patrón en múltiples proyectos nuevos y existentes.

Su enfoque principal es:

- Mantener consistencia entre proyectos.
- Facilitar el mantenimiento.
- Segmentar responsabilidades.
- Evitar rutas monolíticas.
- Reducir retrabajos futuros.

---

## 2. Principios generales

- Arquitectura basada en features: cada módulo de negocio es una unidad independiente.
- Separación de responsabilidades: UI, datos, rutas, lógica y tipos deben vivir en capas claras.
- Reutilización: componentes, hooks y layouts comunes se alojan en `shared`.
- Tipado fuerte: cada contrato debe estar tipado en `interfaces` o `types`.
- Documentación ligera: cada archivo debe tener un comentario que explique su responsabilidad.
- Rutas segmentadas: cada módulo debe tener su propio archivo de rutas.

---

## 3. Estructura base recomendada

```text
src/
├── api/
│   └── client.ts
├── assets/
│   └── images/
├── interfaces/
│   ├── components/
│   ├── filters/
│   ├── requests/
│   └── responses/
├── lib/
│   ├── constants/
│   ├── helpers/
│   ├── queries-key/
│   ├── extensions/
│   └── key-value-pairs/
├── modules/
│   ├── employees/
│   │   ├── api/
│   │   │   └── employees.api.ts
│   │   ├── components/
│   │   │   ├── EmployeeForm.tsx
│   │   │   └── EmployeeTable.tsx
│   │   ├── hooks/
│   │   │   ├── useEmployees.ts
│   │   │   └── useEmployeeDetail.ts
│   │   ├── layouts/
│   │   │   └── EmployeesLayout.tsx
│   │   ├── pages/
│   │   │   ├── EmployeesPage.tsx
│   │   │   └── EmployeeDetailPage.tsx
│   │   ├── routes/
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   └── employees.types.ts
│   │   └── index.tsx
│   └── students/
│       ├── api/
│       ├── components/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       ├── routes/
│       ├── types/
│       └── index.tsx
├── routes/
│   ├── app.router.tsx
│   └── protected.router.tsx
├── shared/
│   ├── components/
│   ├── context/
│   │   └── index.ts
│   ├── hooks/
│   ├── layouts/
│   │   └── page-layouts.tsx
│   ├── pages/
│   ├── stores/
│   └── ui/
├── App.tsx
├── main.tsx
└── index.css
```

---

## 4. Organización de cada módulo

Cada módulo debe contener carpetas específicas para sus responsabilidades:

- `routes/`: rutas del módulo.
- `pages/`: componentes de página del módulo.
- `layouts/`: layouts propios del módulo.
- `hooks/`: hooks reutilizables del módulo.
- `api/`: llamadas HTTP del módulo.
- `types/`: tipos y contratos locales.
- `components/`: componentes específicos del módulo.

De esta forma, el módulo es autocontenido y claramente delimitado.

---

## 5. Rutas por módulo

Es obligatorio que cada módulo tenga su propio archivo de rutas. Esto evita que el router global crezca demasiado y hace más sencillo agregar, eliminar o cargar módulos dinámicamente.

Ejemplo de `src/modules/employees/routes/index.ts`.

```
import type { RouteObject } from "react-router-dom"
import { EmployeesLayout } from "../layouts/EmployeesLayout"
import { EmployeesPage } from "../pages/EmployeesPage"
import { EmployeeDetailPage } from "../pages/EmployeeDetailPage"

export const employeesRoutes: RouteObject[] = [
  {
    path: "employees",
    element: <EmployeesLayout />,
    children: [
      { index: true, element: <EmployeesPage /> },
      { path: ":id", element: <EmployeeDetailPage /> },
    ],
  },
]
```

Posteriormente, el router principal importa las rutas segmentadas de cada módulo.

```
import { createBrowserRouter } from "react-router-dom"
import { employeesRoutes } from "../modules/employees/routes"
import { studentsRoutes } from "../modules/students/routes"

export const router = createBrowserRouter([
  ...employeesRoutes,
  ...studentsRoutes,
])
```

---

## 6. Uso de layouts por módulo

Cada módulo debe disponer de al menos un layout propio en `src/modules/<feature>/layouts/`.

Este layout:

- Envuelve las páginas del módulo.
- Permite compartir valores de contexto específicos del módulo.
- Puede utilizar `Outlet` y `useOutletContext` para pasar datos a las páginas hijas.
- Mantiene una UI consistente dentro del módulo.

Ejemplo de layout de módulo.

```
// src/modules/employees/layouts/EmployeesLayout.tsx
import { Outlet } from "react-router-dom"

type EmployeesLayoutContext = {
  moduleName: "employees"
  headerTitle: string
}

export const EmployeesLayout = () => {
  const context: EmployeesLayoutContext = {
    moduleName: "employees",
    headerTitle: "Gestión de Empleados",
  }

  return (
    <div className="employees-layout">
      <header>{context.headerTitle}</header>
      <Outlet context={context} />
    </div>
  )
}
```

Y una página que consume el contexto de ruta.

```
// src/modules/employees/pages/EmployeesPage.tsx
import { useOutletContext } from "react-router-dom"

type EmployeesLayoutContext = {
  moduleName: "employees"
  headerTitle: string
}

export const EmployeesPage = () => {
  const { moduleName, headerTitle } = useOutletContext<EmployeesLayoutContext>()

  return (
    <div>
      <h1>{headerTitle}</h1>
      <p>Este módulo es: {moduleName}</p>
    </div>
  )
}
```

Este patrón permite:

- Compartir datos comunes del módulo.
- Definir configuraciones por contexto de ruta.
- Mantener la página ligera y enfocada en su UI.

## 7. Responsabilidades de cada carpeta

### `src/api/`

- Cliente HTTP global.
- Configuración de `baseURL`.
- Interceptores.
- Headers comunes.

### `src/interfaces/`

Contratos globales de entrada y salida.

- `requests/`: payloads enviados al backend.
- `responses/`: datos recibidos.
- `filters/`: parámetros de búsqueda.
- `components/`: props de componentes reutilizables.

### `src/lib/`

- Constantes globales.
- Helpers puros.
- Keys de React Query.
- Mapeos clave-valor.
- Extensiones de utilidad.

### `src/modules/`

Cada módulo de negocio contiene su propia estructura:

- `pages`
- `layouts`
- `hooks`
- `api`
- `routes`
- `types`
- `components`

### `src/routes/`

- Router raíz.
- Rutas protegidas.
- Wrappers globales de rutas.

### `src/shared/`

Elementos reutilizables entre módulos:

- Componentes compartidos.
- Contextos globales.
- Layouts comunes.
- Componentes UI genéricos.

---

## 8. Convenciones de nombres

- Componentes: `PascalCase`
- Hooks: `useXxx`
- Tipos: `XxxType`, `XxxProps`
- Archivos de rutas: `index.ts`
- Archivos de páginas: `XxxPage.tsx`
- Archivos de layouts: `XxxLayout.tsx`
- Carpetas de features: `kebab-case`
- Archivos de API: `employees.api.ts`, `students.api.ts`

---

## 9. Comentarios y documentación

Cada archivo debe incluir un comentario corto que explique:

- Su responsabilidad.
- Qué exporta.
- Por qué existe.

Ejemplos:

```ts
// Layout principal del módulo Employees

// Hook para obtener la lista de empleados

// Rutas del módulo Students
```

Esto reduce la necesidad de consultar a otros desarrolladores y agiliza el onboarding.

---

## 10. Recomendaciones para nuevos módulos

Cada nuevo módulo debe seguir este patrón:

```
src/modules/<feature>/
  api/
    <feature>.api.ts
  components/
    ...
  hooks/
    use<Feature>.ts
  layouts/
    <Feature>Layout.tsx
  pages/
    <Feature>Page.tsx
    <Feature>DetailPage.tsx
  routes/
    index.ts
  types/
    <feature>.types.ts
  index.tsx
```

### Flujo de desarrollo

1. Definir los tipos en `types/`.
2. Crear las llamadas al backend en `api/`.
3. Definir `routes/index.ts`.
4. Implementar `layouts/<Feature>Layout.tsx`.
5. Desarrollar las páginas en `pages/`.
6. Agregar hooks locales en `hooks/`.
7. Exportar la página raíz desde `index.tsx`.
8. Importar las rutas del módulo en `routes/app.router.tsx`.

---

## 11. Resultado esperado

Adoptando esta estructura:

- Cada proyecto mantiene la misma organización base.
- Las rutas se segmentan por módulo.
- Los layouts permiten compartir valores mediante el contexto de ruta.
- El backend se integra desde `api/`.
- Los módulos son autosuficientes y escalables.
- El código se vuelve más mantenible y fácil de extender.

Este documento debe ser la referencia principal para estructurar proyectos React modernos y evitar retrabajos futuros.

---

## 12. Reglas explícitas para la IA

### Objetivo
Estas reglas son obligatorias para cualquier IA que genere o modifique código en este proyecto. Su propósito es mantener la consistencia arquitectónica y evitar cambios innecesarios.

### Reglas generales
- Respetar esta arquitectura antes que cualquier convención por defecto.
- Modificar el menor número posible de archivos.
- No reestructurar el proyecto salvo solicitud explícita.
- No crear carpetas equivalentes si ya existen.
- No mover ni renombrar archivos públicos sin autorización.
- Reutilizar código existente antes de crear uno nuevo.
- Mantener el estilo del proyecto.
- Si una decisión es ambigua, explicar la alternativa en lugar de asumirla.

### Reutilización
Antes de crear un componente, hook, helper, tipo o constante, revisar primero `shared`, `lib`, `interfaces` y el módulo correspondiente. No duplicar responsabilidades.

### Separación de responsabilidades
Flujo obligatorio:
```text
UI
↓
Hook
↓
API
↓
Cliente HTTP
↓
Backend
```
- Los componentes nunca realizan llamadas HTTP.
- Los hooks contienen la lógica de React Query.
- `api/` solo contiene llamadas HTTP.
- `client.ts` centraliza configuración e interceptores.

### React Query
- Todas las consultas y mutaciones deben encapsularse en hooks.
- No usar `fetch` directamente desde componentes.
- Centralizar Query Keys en `lib/queries-key`.

### Componentes
Los componentes deben enfocarse en la presentación. No deben contener lógica de negocio, llamadas HTTP ni transformaciones complejas.

### Uso de shared
Mover un recurso a `shared` únicamente cuando sea reutilizado por dos o más módulos o exista una razón arquitectónica clara.

### Formularios
- React Hook Form.
- Zod para validación.
- Evitar formularios completos con `useState`.

### Estados UI
Cada página debe contemplar Loading, Error, Empty y Success.

### Imports
Orden: React, librerías, shared, módulo, tipos y estilos. Utilizar alias `@/`.

### Tamaño recomendado
- Componentes: 150 líneas.
- Hooks: 100 líneas.
- Páginas: 250 líneas.
- API: 200 líneas.
Superados estos valores, evaluar dividir responsabilidades.

### Accesibilidad
- Formularios con `label`.
- Botones de icono con `aria-label`.
- Imágenes con `alt`.

### Performance
No utilizar `useMemo`, `useCallback` o `React.memo` sin una justificación basada en rendimiento.

### Lazy Loading
Preferir `React.lazy`, `Suspense` y code splitting por módulo en proyectos grandes.

### Testing
Utilizar Vitest y Testing Library. Priorizar pruebas de hooks y helpers antes que componentes puramente visuales.
