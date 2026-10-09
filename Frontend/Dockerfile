FROM node:22-alpine
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.21.0 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ENV NEXT_PUBLIC_API_URL=http://localhost:3000
RUN pnpm build
EXPOSE 3001
CMD ["pnpm", "start"]
