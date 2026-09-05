FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV NODE_OPTIONS=--dns-result-order=ipv4first

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY scripts ./scripts
COPY data ./data

CMD ["sh", "-c", "npm run deploy || echo '[startup] Komut kaydı başarısız; bot yine de başlatılıyor.'; exec npm start"]
