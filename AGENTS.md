# AGENTS.md

Manual operativo de User Control. Léelo antes de cambiar código. El chat con el usuario es en español. El código, los mensajes de la API y los identificadores van en inglés.

## Control de la terminal

El agente no ejecuta comandos. Ni install, ni tests, ni lint, ni build, ni Docker, ni migraciones, ni git, ni borrados.

Antes de cualquier comando el agente escribe:

1. El directorio exacto.
2. El comando exacto.
3. Para qué sirve y qué efecto tiene (crea contenedores, borra volúmenes, instala paquetes, modifica git).

El usuario lo corre y pega el resultado. Si el comando puede borrar datos (`docker compose down -v`, `db:seed:undo`, resets), el agente lo dice en la misma propuesta y espera un sí explícito.

## Qué es este repositorio

Prueba fullstack de Cymetria. Existen el backend y el frontend. El frontend es un cliente de la API: no replica la arquitectura hexagonal.

No reescribas el stack. No agregues Redis, colas, microservicios ni un segundo ORM. Extiende lo que ya está.

Gestor de paquetes: **pnpm 11.21.0**, declarado en `Backend/package.json` y en `Frontend/package.json`. Los lockfiles son `Backend/pnpm-lock.yaml` y `Frontend/pnpm-lock.yaml`. No crees `package-lock.json` ni uses npm.

## Stack

### Backend (existe)

| Pieza | Elección |
| --- | --- |
| Runtime | Node.js 20 o superior. La imagen Docker usa Node 22 Alpine |
| Lenguaje | TypeScript estricto, decoradores emitidos para tsyringe |
| HTTP | Express 4 |
| ORM | Sequelize 6 + sequelize-typescript |
| Migraciones | Sequelize CLI. El proceso no llama a `sync()` |
| Base de datos | MySQL 8.4, driver `mysql2`, charset `utf8mb4` |
| Inyección | tsyringe. El token del repositorio es `USER_REPOSITORY_TOKEN` |
| Validación HTTP | Zod, solo en el adaptador HTTP |
| CORS | Paquete `cors`. Origen `CORS_ORIGIN` |
| Tests | Jest + ts-jest. No tocan MySQL |
| Estilo | ESLint y Prettier (tabs, comillas dobles, LF) |

### Frontend

| Pieza | Elección |
| --- | --- |
| App | Next.js (App Router) + React + TypeScript. Puerto `3001` |
| Datos de servidor | TanStack Query. La lista, la página y las mutaciones viven aquí |
| Estado de interfaz | Zustand solo para el diálogo de crear, editar y borrar. La lista no se copia al store |
| Estilos | Tailwind CSS. Sin librería de componentes: la prueba permite shadcn, y para esta pantalla no hace falta |
| Paquetes | pnpm 11.21.0. El lockfile es `Frontend/pnpm-lock.yaml`, se crea al instalar |

La UI llama a `http://localhost:3000`. `CORS_ORIGIN` del backend ya permite `http://localhost:3001`. En Compose el frontend se publica en el puerto 3001. Para iterar sin reconstruir la imagen, se levanta con `pnpm dev`.

## Puertos

| Qué | En tu máquina | Dentro de Docker |
| --- | --- | --- |
| API | `localhost:3000` | el contenedor escucha `3000` |
| Frontend | `localhost:3001` | el contenedor escucha `3001` |
| MySQL | `127.0.0.1:3307` | el servicio se llama `mysql` y escucha `3306` |

El backend dentro de Compose usa `DB_HOST=mysql` y `DB_PORT=3306`. Un proceso en el host usa `127.0.0.1` y `3307`. Esos valores ya están en `Backend/.env.example`.

`CORS_ORIGIN` por defecto es `http://localhost:3001`.

## Mapa del repositorio

```
UserControl-Cymetria/
  AGENTS.md
  README.md
  docker-compose.yml
  Backend/
    Dockerfile
    docker-entrypoint.sh
    package.json
    pnpm-lock.yaml
    src/
    test/
  Frontend/
    package.json
    src/
```

## Nombres

| Elemento | Forma | Ejemplo |
| --- | --- | --- |
| Carpetas | camelCase. Nunca snake_case | `useCases`, `userForm` |
| Archivos TypeScript | PascalCase, igual que la clase o símbolo principal. Sin sufijo de carpeta | `CreateUserUseCase.ts`, `EmailAlreadyInUseError.ts` |
| Clases, tipos, componentes React | PascalCase | `CreateUserUseCase`, `UserTable` |
| Funciones y variables | camelCase, con verbo | `presentUser`, `isValidPagination` |
| Constantes de dominio | objeto `as const` | `USER_LIMITS` |
| Variables de entorno | MAYÚSCULAS | `DB_HOST`, `SEED_USERS` |

Una clase o función pública por archivo. El nombre del archivo es el del export, en PascalCase. La carpeta ya dice el rol, así que no se añade `.error`, `.use-case` ni `.controller`.

El hexágono no depende de esos nombres. Depende de que el dominio no importe Express, Sequelize, Zod ni MySQL.

Excepciones de nombre, porque las exige la herramienta:

- `index.ts` sigue en minúsculas. Es el arranque de Node.
- `page.tsx`, `layout.tsx`, `icon.tsx` y `route.ts` de Next van en minúsculas. El framework los busca así.
- Las migraciones y los seeders conservan `fecha-descripcion.js`. Sequelize guarda ese nombre en `SequelizeMeta`. Renombrarlos haría que la CLI intente crear la tabla otra vez.

## Backend: capas

La dependencia apunta hacia dentro. Un caso de uso conoce el puerto `UserRepository`. No conoce Sequelize. El controlador conoce los casos de uso. No contiene reglas de negocio.

```
HTTP  ->  caso de uso  ->  UserRepository (puerto)  ->  UserRepositorySequelize  ->  MySQL
```

```
Backend/src/
  index.ts                         arranque: env, contenedor, conexión, listen
  App.ts                           Express: json, cors, rutas, 404, errores
  Container.ts                     registra UserRepository -> UserRepositorySequelize
  config/
    Envs.ts                        lee .env desde el directorio de trabajo y falla si falta la base
    Database.ts                    instancia Sequelize, reintenta authenticate, no hace sync
    SequelizeCli.js                misma base, usada solo por la CLI
  domain/
    entities/User.ts               usuario inmutable; create y update validan
    errors/                        DomainError.ts, EmailAlreadyInUseError.ts, ...
    ports/UserRepository.ts        contrato de persistencia y de lectura por cursor
    validation/AssertUserId.ts
  application/
    useCases/                      CreateUserUseCase.ts y el resto de operaciones
    constants/UserConstants.ts
    tokens/UserRepositoryToken.ts
    ports/TextWriter.ts            destino del CSV, sin saber que es HTTP
  infrastructure/
    errors/InfrastructureError.ts
    db/sequelize/
      models/UserModel.ts
      repositories/UserRepositorySequelize.ts
      MapDatabaseError.ts
      migrations/                  nombres con fecha, no se renombran
      seeders/
    http/
      controllers/UserController.ts
      routes/v1/UserRoute.ts
      middlewares/ErrorMiddleware.ts
      parsers/UserHttpParser.ts
      presenters/UserPresenter.ts
  decorators/WithTryCatch.ts       pasa los rechazos async al middleware de errores
```

### Casos de uso

| Clase | Hace |
| --- | --- |
| `CreateUserUseCase` | normaliza, rechaza email repetido, guarda |
| `GetUserByIdUseCase` | exige UUID v4 y que exista |
| `UpdateUserUseCase` | PATCH parcial; al menos un campo |
| `DeleteUserUseCase` | borra solo si existe |
| `ListUsersUseCase` | página con tope y orden fijo |
| `ExportUsersUseCase` | CSV por lotes con cursor |

El id lo genera el caso de uso con `randomUUID()`, no la base. Así el dominio no depende del default de MySQL.

### Errores

| Código | HTTP | Cuándo |
| --- | --- | --- |
| `INVALID_USER_INPUT` | 400 | nombre, email, id o JSON inválido |
| `INVALID_PAGINATION` | 400 | page menor que 1 o pageSize fuera de 1..100 |
| `USER_NOT_FOUND` | 404 | el id no existe |
| `EMAIL_ALREADY_IN_USE` | 409 | email ya registrado, también si gana la condición de carrera del índice único |
| `ROUTE_NOT_FOUND` | 404 | ruta desconocida |
| `INTERNAL_ERROR` | 500 | fallo de infraestructura. El cliente no ve el SQL |

El caso de uso lanza `DomainError`. El middleware elige el status. `InfrastructureError` se registra con su `cause` y al cliente le llega el mensaje genérico.

### API

Prefijo: `/api/v1/users`.

| Método | Ruta | Respuesta |
| --- | --- | --- |
| `POST` | `/api/v1/users` | `201` `{ data }` |
| `GET` | `/api/v1/users?page=1&pageSize=10` | `200` `{ data, page, pageSize, total, totalPages }` |
| `GET` | `/api/v1/users/export` | CSV `users.csv`. Esta ruta va antes de `/:id` |
| `GET` | `/api/v1/users/:id` | `200` `{ data }` |
| `PATCH` | `/api/v1/users/:id` | `200` `{ data }` |
| `DELETE` | `/api/v1/users/:id` | `204` sin cuerpo |

Orden de la lista y del export: `createdAt` ascendente, luego `id`. Página por defecto 1, tamaño 10, máximo 100. Una página más allá del final devuelve `data: []` y el `total` real. `totalPages` es 0 si no hay filas.

El email se guarda en minúsculas. El nombre se recorta y admite hasta 100 caracteres.

### Listado y exportación no comparten consulta

`findPage` usa offset porque la API es por página y el tamaño está topado en 100.

`findExportBatch` usa cursor:

```sql
WHERE (`createdAt`, `id`) > (?, ?)
ORDER BY `createdAt`, `id`
LIMIT 500
```

El lote es `USER_LIMITS.EXPORT_BATCH_SIZE` (500). Cada lote se escribe y se descarta. Entre lote y lote la conexión vuelve al pool. Si `res.write` satura el socket, el controlador espera el evento `drain`. El archivo lleva BOM UTF-8 para Excel. Un valor que empieza por `=`, `+`, `-` o `@` se prefija con apóstrofe para que Excel no lo trate como fórmula.

Si la primera consulta falla, todavía no se escribió el cuerpo y el cliente recibe JSON de error. Si falla a mitad del stream, la respuesta se cierra: ya no se puede cambiar a JSON.

Ese diseño cubre cientos, miles y decenas de miles de filas. La conexión HTTP sigue abierta durante la descarga. Cientos de miles de filas o una generación de minutos serían un job. No lo implementes ahora.

### Base de datos

Tabla `users`: `id` UUID, `name`, `email` único, `createdAt` y `updatedAt` como `datetime(3)`. Índice `users_created_at_id_idx` sobre (`createdAt`, `id`) para el cursor.

La migración manda. El modelo la refleja. No actives `sync()` ni `alter`.

Al arrancar el contenedor, `docker-entrypoint.sh` reintenta `pnpm db:migrate`, luego `pnpm db:seed`, luego `pnpm start`. El seed inserta solo si `users` está vacía. Sequelize CLI además no repite un seeder ya anotado en `SequelizeData`. La cantidad sale de `SEED_USERS` (1 a 20000, por defecto 25). Cada usuario de prueba queda a un segundo del anterior para que el orden no dependa de milisegundos que el driver pueda recortar.

Zona horaria de la conexión: UTC (`+00:00`).

En el modelo, los atributos van con `declare`. Un campo de clase público pisa el getter de Sequelize y `name` o `email` llegan `undefined`. El repositorio lee con `getDataValue`.

## Frontend: cómo está armado

Las rutas de Next solo componen pantallas. La lógica vive en la feature `users`.

```
Frontend/src/
  app/
    layout.tsx          fuente, Tailwind y el proveedor de TanStack Query
    page.tsx            redirige a /users
    icon.tsx
    users/page.tsx      compone UsersScreen
  features/users/
    api/                list, create, update, delete y la URL del CSV
    components/         UsersScreen, UserTable, UserFormDialog, UserPagination
    hooks/              useUserList y las mutaciones
    store/              UserDialogStore: diálogo abierto, modo y usuario elegido
    types/
    constants/          USER_PAGE_SIZE = 10
  shared/
    components/         Dialog y AppProviders
    lib/                cliente HTTP y URL del backend
```

Carpetas de más de una palabra en camelCase: `userForm`, no `user_form` ni `user-form`. Los componentes van en PascalCase (`UserTable.tsx`). Los archivos que Next exige (`page.tsx`, `layout.tsx`, `icon.tsx`) se quedan en minúsculas.

Qué hace la pantalla:

- Lista una página de la API (`page`, `pageSize` de 10, 25 o 50, y `search` opcional). Esos tres valores van en la URL.
- Crear, editar y borrar pasan por diálogos. Zustand guarda solo si el diálogo está abierto, el modo y el usuario elegido.
- Tras crear, la pantalla abre la última página: el orden del API es `createdAt` ascendente, así que el registro nuevo queda al final.
- Si al borrar la página queda vacía, vuelve a la última página con datos.
- Exportar es un enlace a `GET /api/v1/users/export`. El navegador descarga el CSV. La página no lo acumula en memoria.
- En pantallas chicas la lista son tarjetas. Desde el breakpoint mediano es una tabla. Botones y campos tienen al menos 44px.

La búsqueda por nombre o correo ya está en `GET /api/v1/users?search=`. El repositorio filtra con `LIKE` y después aplica la página. El total es el del filtro. No se descarga la tabla para buscar en el cliente, y el resultado no se guarda en Zustand. El CSV de exportación sigue siendo la tabla completa.

No hay capa hexagonal en el cliente: no crees puertos, casos de uso ni un dominio paralelo al backend.

## Comandos

El agente los propone. El usuario los ejecuta.

Desde la raíz del repositorio:

```bash
docker compose up --build
docker compose ps
```

`docker compose down -v` borra el volumen de MySQL, la tabla y el registro del seed. No lo propongas como paso rutinario.

Desde `Backend/`:

```bash
pnpm install
pnpm dev
pnpm test
pnpm lint
pnpm db:migrate
pnpm db:seed
pnpm db:seed:undo
```

`pnpm dev` necesita `Backend/.env` (está en `.gitignore`). La plantilla es `.env.example`.

Desde `Frontend/`:

```bash
pnpm install
pnpm dev
pnpm lint
```

`pnpm install` crea `node_modules` y `Frontend/pnpm-lock.yaml`. `pnpm dev` sirve `http://localhost:3001`. No toca Docker ni MySQL. La API tiene que estar en el puerto 3000.

## Qué no hacer

- No muevas reglas de negocio al controlador ni lances `HttpException` desde un caso de uso.
- No cargues todos los usuarios para exportar ni para listar.
- No subas `pageSize` por encima de 100 para “aprovechar” el listado como export.
- No uses Zustand para guardar la respuesta del servidor.
- No agregues shadcn ni otra librería de componentes. La pantalla está hecha con Tailwind.
- No filtres la lista en el cliente descargando todos los usuarios. El buscador, cuando se haga, va a la API.
- No agregues dependencia sin una razón que quepa en una frase.
- No ejecutes la terminal por tu cuenta.
