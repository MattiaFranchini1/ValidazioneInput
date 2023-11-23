# Usa un'immagine base con Node.js
FROM node:14

# Imposta la directory di lavoro all'interno del container
WORKDIR /media/mattia/Ventoy/source/node/gep_es

# Copia il file package.json e package-lock.json
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia il resto dell'applicazione
COPY . .

# Esponi la porta su cui l'applicazione ascolterà
EXPOSE 3000

ENV DATABASE=db_login
ENV DATABASE_HOST=116.203.147.5
ENV DATABASE_PORT=9000
ENV DATABASE_ROOT=root
ENV DATABASE_PASSWORD=password


# Comando per avviare l'applicazione
CMD ["node", "app.js"]
