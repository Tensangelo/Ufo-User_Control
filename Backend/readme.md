# User Control API

Backend de usuarios. Node.js, Express y TypeScript, con arquitectura hexagonal. Este documento es para levantarlo solo, sin el frontend y sin levantar todo Docker.

El detalle de decisiones para quien modifica el código está en el [AGENTS.md](../AGENTS.md) de la raíz. El arranque con Docker de API y MySQL juntos está en el [README raíz](../README.md).

## Stack

| Pieza | Versión / elección |
| --- | --- |
| Node.js | 20 o superior. La imagen Docker usa Node 22 |
| Paquetes | pnpm 11.21.0. No uses npm |
| Lenguaje | TypeScript estricto |
| HTTP | Express 4 |
| Validación de entrada | Zod, solo en la capa HTTP |
| Inyección | tsyringe |
| ORM | Sequelize 6 y sequelize-typescript |
| Migraciones | Sequelize CLI. La aplicación no usa `sync()`. El porqué está en el README de la raíz |
| Base de datos | MySQL 8, driver mysql2, utf8mb4, hora UTC |
| Tests | Jest y ts-jest. No necesitan MySQL |
| Estilo | ESLint y Prettier |

## Arquitectura

Las dependencias apuntan hacia el dominio.

```
HTTP → caso de uso → puerto UserRepository → UserRepositorySequelize → MySQL
```

| Carpeta | Responsabilidad |
| --- | --- |
| `src/domain` | `User`, errores de negocio y el contrato del repositorio. No importa Express ni Sequelize |
| `src/application/useCases` | Una clase por operación: crear, leer, actualizar, borrar, listar y exportar |
| `src/infrastructure` | MySQL, Express, Zod y la traducción de errores a HTTP |
| `src/config` | Variables de entorno y la conexión |

Los archivos van en PascalCase y se llaman como la clase que exportan (`CreateUserUseCase.ts`, `EmailAlreadyInUseError.ts`). La carpeta ya dice el rol, así que el archivo no lleva `.error` ni `.use-case`. `index.ts` se queda en minúsculas porque es el arranque de Node. Las migraciones conservan el nombre con fecha: Sequelize lo usa como identidad y renombrarlo volvería a ejecutarlas.

## API

Base: `http://localhost:3000`

| Método | Ruta | Respuesta |
| --- | --- | --- |
| `POST` | `/api/v1/users` | `201` `{ data }` |
| `GET` | `/api/v1/users?page=1&pageSize=10` | `200` `{ data, page, pageSize, total, totalPages }` |
| `GET` | `/api/v1/users/export` | CSV `users.csv` |
| `GET` | `/api/v1/users/:id` | `200` `{ data }` |
| `PATCH` | `/api/v1/users/:id` | `200` `{ data }` |
| `DELETE` | `/api/v1/users/:id` | `204` |

`page` empieza en 1. `pageSize` va de 1 a 100. `search` es opcional: se recorta y filtra por nombre o correo; `total` y `totalPages` son los de ese filtro. El orden es `createdAt` y después `id`, ambos ascendentes. Una página fuera de rango devuelve `data` vacía y el `total` real. Email duplicado: `409`. Usuario inexistente: `404`. Datos inválidos: `400`.

El export no carga la tabla. Lee lotes de 500 con un cursor `(createdAt, id)` y los escribe al response. Sirve igual con 100, 5.000 o 10.000 filas.

## Ejecutar sin Docker

Hace falta Node 20 o superior, pnpm 11 y un MySQL 8 accesible. La API corre en tu máquina. MySQL puede ser uno instalado en el equipo o solo el servicio `mysql` de Compose.

Desde `Backend/`:

```bash
copy .env.example .env
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

`pnpm dev` deja el proceso en `http://localhost:3000` y recarga al guardar.

### MySQL solo con Docker, API en local

Desde la raíz del repositorio, esto levanta únicamente la base. No construye ni arranca el contenedor del backend.

```bash
docker compose up -d mysql
```

En `Backend/.env` deja:

```
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=user_control
DB_PASSWORD=user_control
DB_NAME=user_control
```

Eso es lo que ya trae `.env.example`. El `3307` es el puerto publicado en tu máquina. Dentro de Docker la base sigue en `3306`.

### MySQL instalado en el equipo

Crea la base y el usuario, y en `.env` pon el puerto real, normalmente `3306`:

```sql
CREATE DATABASE user_control CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'user_control'@'%' IDENTIFIED BY 'user_control';
GRANT ALL PRIVILEGES ON user_control.* TO 'user_control'@'%';
```

Luego los mismos `pnpm db:migrate`, `pnpm db:seed` y `pnpm dev`.

## Variables

| Variable | Uso |
| --- | --- |
| `PORT` | Puerto HTTP. Por defecto `3000` |
| `NODE_ENV` | `development` imprime el SQL. `production` no |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexión. Si falta alguna, el proceso no arranca |
| `CORS_ORIGIN` | Origen permitido. Por defecto `http://localhost:3001` |
| `SEED_USERS` | Filas del seed, de 1 a 20000. Por defecto 25. Solo la lee el seeder |

`.env` no se sube al repositorio. `.env.example` sí.

El seed corre una sola vez. Sequelize lo anota en `SequelizeData` y, además, no inserta si `users` ya tiene filas. Para cambiar la cantidad hay que deshacer el seed y volver a sembrarlo:

```bash
pnpm db:seed:undo
pnpm db:seed
```

`db:seed:undo` borra los usuarios de prueba.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `pnpm dev` | Desarrollo con recarga |
| `pnpm build` | Compila a `dist/` |
| `pnpm start` | Ejecuta `dist/index.js` |
| `pnpm test` | Tests unitarios, sin MySQL |
| `pnpm lint` | ESLint |
| `pnpm db:migrate` | Aplica migraciones |
| `pnpm db:seed` | Siembra usuarios |
| `pnpm db:seed:undo` | Quita la siembra |

## Tests

```bash
pnpm test
pnpm lint
```

Cubren el alta, el email duplicado, la página, la búsqueda, la paginación inválida, el CSV por lotes, el controlador y el mapeo del `409`.
