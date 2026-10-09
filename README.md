# User Control

Directorio de usuarios. El backend es una API en Node.js, Express y TypeScript, con arquitectura hexagonal. El frontend es Next.js: una pantalla que lista, crea, edita, borra y exporta. Docker levanta la base, la API y el frontend. Para iterar sin reconstruir imágenes, el backend y el frontend también se pueden correr en local.

El gestor de paquetes es **pnpm**. No uses npm. Los lockfiles son `Backend/pnpm-lock.yaml` y, al instalar el cliente, `Frontend/pnpm-lock.yaml`.

## Levantar con Docker

Desde la raíz del repositorio. Este comando construye las imágenes y deja corriendo MySQL, la API y la pantalla:

```bash
docker compose up --build
```

- Pantalla: http://localhost:3001
- API: http://localhost:3000
- MySQL publicado en el host: `127.0.0.1:3307` (dentro de la red de Compose sigue siendo el puerto 3306)
- Al arrancar, el backend aplica migraciones y siembra 25 usuarios (`user.1@example.com` … `user.25@example.com`)

La primera vez tarda más porque construye las dos imágenes. La pantalla puede tardar unos segundos más que el contenedor en responder, mientras MySQL termina de arrancar y corren las migraciones. El navegador llama a la API en `http://localhost:3000`. Esa dirección queda fijada al construir la imagen del frontend.

Para probar la exportación con más filas, cambia `SEED_USERS` del servicio `backend` (máximo 20000), borra el volumen y vuelve a levantar. El seed solo corre cuando la tabla está vacía y Sequelize aún no lo marcó como ejecutado:

```bash
docker compose down -v
docker compose up --build
```

## Levantar en local

La guía completa del backend (stack, MySQL solo, variables y scripts) está en [Backend/readme.md](Backend/readme.md). Resumen: Node.js 20 o superior, pnpm 11 y MySQL 8.

```bash
cd Backend
copy .env.example .env
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Si MySQL viene del Compose de arriba, el `.env.example` ya apunta a `127.0.0.1:3307`.

## Frontend

La guía del cliente está en [Frontend/readme.md](Frontend/readme.md). Next.js, React, TypeScript, TanStack Query, Zustand y Tailwind. No usa librería de componentes.

Con la API ya en `http://localhost:3000`:

```bash
cd Frontend
pnpm install
pnpm dev
```

Abre http://localhost:3001. La raíz redirige a `/users`.

La pantalla pide páginas de 10, 25 o 50. La página, el tamaño y la búsqueda van en la URL (`/users?search=ada&pageSize=25&page=2`), así que atrás y adelante del navegador funcionan. La búsqueda filtra nombre o correo en la API antes de paginar. Crear, editar y borrar abren un diálogo: Zustand solo recuerda ese diálogo y el usuario elegido. La lista y el caché los lleva TanStack Query. En el teléfono la lista son tarjetas; desde el ancho mediano, una tabla.

Exportar CSV es un enlace a `GET /api/v1/users/export`. El navegador descarga el archivo completo. La página no lo guarda en memoria.

## Tests y lint

```bash
cd Backend
pnpm install
pnpm test
pnpm lint
```

```bash
cd Frontend
pnpm lint
```

Los tests no necesitan MySQL. Cubren creación, paginación, búsqueda, exportación por lotes y el adaptador HTTP. El lint del cliente usa la configuración de Next.

## API

| Método | Ruta | Respuesta |
| --- | --- | --- |
| `POST` | `/api/v1/users` | `201` `{ data }` |
| `GET` | `/api/v1/users?page=1&pageSize=10` | `200` `{ data, page, pageSize, total, totalPages }` |
| `GET` | `/api/v1/users/:id` | `200` `{ data }` |
| `PATCH` | `/api/v1/users/:id` | `200` `{ data }` |
| `DELETE` | `/api/v1/users/:id` | `204` |
| `GET` | `/api/v1/users/export` | CSV `users.csv` |

`page` arranca en 1. `pageSize` va de 1 a 100. `search` es opcional y busca en el nombre o en el correo; `total` y `totalPages` son los del resultado filtrado. El orden es siempre `createdAt` ascendente y, a igualdad, `id`. Una página fuera de rango devuelve `data` vacía con el `total` real. Un usuario inexistente responde `404`. Un email repetido responde `409`.

Cada usuario en `data` trae `id`, `name`, `email`, `createdAt` y `updatedAt`. `createdAt` no cambia. `updatedAt` nace igual y se mueve al editar.

```bash
curl "http://localhost:3000/api/v1/users?page=1&pageSize=10"
curl -o users.csv "http://localhost:3000/api/v1/users/export"
```

## Decisiones

### Arquitectura

El dominio no importa Express, Sequelize ni MySQL. Cada operación es un caso de uso en `application/useCases`. El controlador solo traduce HTTP. Los errores de negocio (`INVALID_USER_INPUT`, `INVALID_PAGINATION`, `USER_NOT_FOUND`, `EMAIL_ALREADY_IN_USE`) nacen en el dominio; el middleware les pone el status. Un fallo de base de datos es un error de infraestructura y el cliente recibe un `500` genérico. Sequelize, tsyringe, Express y MySQL son el stack del proyecto base, extendido.

### Por qué Sequelize CLI

El esquema no se crea al arrancar. `sequelize.sync()` y `sync({ alter: true })` leen el modelo y tocan la base en cada proceso. No dejan historial, dos arranques pueden pisarse, y el cambio que viste en local no es necesariamente el que aplica Docker. La aplicación no llama a `sync()`.

Sequelize CLI ejecuta archivos de migración una sola vez y guarda el nombre en `SequelizeMeta`. El mismo comando corre en la máquina (`pnpm db:migrate`) y dentro del contenedor, antes de `pnpm start`. La migración es la fuente de verdad: email único, `datetime(3)` e índice `(createdAt, id)` que usa el cursor del export. El modelo de runtime solo la refleja.

El costo es una herramienta de más, y las migraciones van en JavaScript porque la CLI las ejecuta sin compilar TypeScript. El nombre del archivo es la identidad. Renombrarlo haría que la CLI tratara la migración como nueva e intentara crear la tabla otra vez.

### Exportación

`GET /api/v1/users/export` no carga la tabla. Lee lotes de 500 con un cursor `(createdAt, id)`:

```sql
WHERE (`createdAt`, `id`) > (?, ?)
ORDER BY `createdAt`, `id`
LIMIT 500
```

Cada lote se escribe al response y se descarta. La memoria no crece con 100, 5 000 o 10 000 usuarios. Cada consulta devuelve la conexión al pool antes de la siguiente, y si el cliente lee despacio la escritura espera a que el socket drene, para no acumular el archivo en RAM. El archivo es CSV con BOM UTF-8, que Excel abre sin un workbook en memoria.

Ese diseño aguanta bien decenas de miles de filas. La conexión HTTP sigue abierta mientras dura la descarga. Si el volumen pasara a cientos de miles o la generación tardara minutos, el siguiente paso sería un job en segundo plano. No hace falta para este caso, y meter Redis o una cola ahora sería infraestructura de más.

La paginación del listado sí usa página y tamaño, con tope de 100. Ahí el offset es aceptable porque la página es pequeña. El export no reutiliza ese método.

### Frontend

El cliente no repite el hexágono. `features/users/api` llama a la API. TanStack Query pide una página y, tras crear, editar o borrar, invalida esa caché. Zustand guarda el modo del diálogo (`crear`, `editar`, `borrar`) y el usuario sobre el que actúa. Tailwind resuelve layout, foco, contraste y los dos anchos: tarjetas o tabla.

La pantalla ofrece 10, 25 o 50 filas. El tope de 100 sigue siendo del API. La búsqueda viaja en `search` y no descarga la tabla para filtrarla en el navegador. El enlace de exportación deja el streaming en el backend y sigue incluyendo a todos los usuarios.

### pnpm

pnpm está declarado en `Backend/package.json` y en `Frontend/package.json` (`packageManager`). Docker instala esa misma versión con Corepack y el lockfile del backend.

## Variables

| Variable | Uso |
| --- | --- |
| `PORT` | Puerto HTTP. Por defecto `3000`. |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexión MySQL. |
| `CORS_ORIGIN` | Origen permitido. El frontend local usa `http://localhost:3001`. |
| `SEED_USERS` | Filas del seed, de 1 a 20000. Por defecto 25. Solo la lee el seeder. |
| `NEXT_PUBLIC_API_URL` | URL de la API que usa el frontend. Por defecto `http://localhost:3000`. Está en `Frontend/.env.example`. |
