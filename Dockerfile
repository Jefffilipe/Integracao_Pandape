# Usar uma imagem base do Node.js
FROM node:18

# Instalar dependências do Oracle Instant Client e ferramentas de compilação
RUN apt-get update && apt-get install -y \
    libaio1 \
    libnsl2 \
    unzip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Definir o diretório de trabalho
WORKDIR /app

# Copiar o Oracle Instant Client para o contêiner
COPY instantclient-basiclite-linux.x64-21.12.0.0.0.zip /app/
RUN unzip /app/instantclient-basiclite-linux.x64-21.12.0.0.0.zip -d /opt/oracle \
    && rm /app/instantclient-basiclite-linux.x64-21.12.0.0.0.zip \
    && ln -s /opt/oracle/instantclient_21_12 /opt/oracle/instantclient \
    && chmod -R 755 /opt/oracle/instantclient

# Configurar variáveis de ambiente para o Oracle Instant Client
ENV LD_LIBRARY_PATH=/opt/oracle/instantclient:$LD_LIBRARY_PATH
ENV ORACLE_HOME=/opt/oracle/instantclient
ENV OCI_LIB_DIR=/opt/oracle/instantclient
ENV OCI_INC_DIR=/opt/oracle/instantclient/sdk/include

# Copiar package.json e instalar dependências
COPY package.json package-lock.json ./
RUN npm install

# Copiar o restante do código
COPY . .

# Expor a porta (o Cloud Run usa PORT=8080)
EXPOSE 8080

# Comando para iniciar a API
CMD ["node", "index.js"]