# User Control Web

Cliente del directorio de usuarios. En Docker Compose se publica en el puerto 3001 junto con la API y MySQL. Para desarrollar, también se puede correr en tu máquina con `pnpm dev` y hablar con la API en el puerto 3000.

El detalle operativo para quien modifica el código está en el [AGENTS.md](../AGENTS.md) de la raíz. El arranque del conjunto está en el [README raíz](../README.md).

## Stack

| Pieza | Elección |
| --- | --- |
| App | Next.js 15, App Router, React 19, TypeScript |
| Datos | TanStack Query. Lista, página, altas, ediciones y bajas |
| Interfaz | Zustand, solo para el diálogo de crear, editar y borrar |
| Estilos | Tailwind CSS 4 |
| Paquetes | pnpm 11.21.0 |

No hay shadcn ni otra librería de componentes. Los controles (diálogo, botones, campos, tabla) son HTML con Tailwind.

## Cómo funciona

`/` redirige a `/users`. La ruta solo monta la pantalla. La lógica está en `src/features/users`.

1. La página lee `page`, `pageSize` y `search` de la URL. Si no viene página, es la 1.
2. TanStack Query pide `GET /api/v1/users` con `page`, `pageSize` (10, 25 o 50) y, si hay texto, `search`.
3. La tabla muestra nombre, correo, fecha de registro y última actualización. Las horas van en formato de 24 horas. Debajo, el rango y los controles de página. Una página fuera de rango vuelve a la última que tiene datos. La búsqueda espera un instante y vuelve a la página 1.
4. Nuevo, editar y eliminar abren un diálogo. Zustand guarda el modo y, si aplica, el usuario elegido. No guarda la lista.
5. Al crear, la pantalla salta a la última página, porque el API ordena por `createdAt` ascendente.
6. Exportar es un enlace a `GET /api/v1/users/export`. El navegador descarga `users.csv`.

En pantallas angostas cada usuario es una tarjeta. Desde 768px es una tabla. El foco es visible, el diálogo atrapa el tabulador y se cierra con Escape, y los controles miden al menos 44px.

## Ejecutar

Hace falta Node.js 20 o superior, pnpm 11 y la API en `http://localhost:3000`.

Desde `Frontend/`:

```bash
pnpm install
pnpm dev
```

`pnpm install` descarga dependencias y crea `pnpm-lock.yaml`. `pnpm dev` deja el proceso en http://localhost:3001 y recarga al guardar. No toca MySQL ni Docker.

La URL de la API sale de `NEXT_PUBLIC_API_URL`. Si no existe el archivo de entorno, el cliente usa `http://localhost:3000`. Para fijarla:

```bash
copy .env.example .env.local
```

`.env.local` no se sube al repositorio.

Otros scripts, desde `Frontend/`:

| Comando | Qué hace |
| --- | --- |
| `pnpm dev` | Desarrollo en el puerto 3001 |
| `pnpm lint` | ESLint con la config de Next |
| `pnpm build` | Compila para producción |
| `pnpm start` | Sirve el build en el puerto 3001 |
