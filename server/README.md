# Tienda Cartas / Cajas (Frontend + Backend)

Este repositorio contiene:

- **public/** → Frontend estático (HTML/CSS/JS).
- **server/** → Backend Node.js (Express + Prisma + Stripe) con carrito, auth, pedidos y checkout.

## Cómo arrancar el backend

1. Instala Node.js (incluye `npm`).
2. Ve a la carpeta `server/` e instala dependencias:

```bash
cd server
npm install
```

3. Copia `server/.env.example` a `server/.env` y pon tus valores reales.

4. Ejecuta las migraciones para crear las tablas en Postgres:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. Lanza el servidor:

```bash
npm run dev
```

El backend escuchará en `http://localhost:3000`.

## Flujo

- El usuario añade productos al carrito.
- Se registra / inicia sesión.
- Hace checkout → Stripe.
- Se genera un pedido con dirección de envío y se descuenta stock.
