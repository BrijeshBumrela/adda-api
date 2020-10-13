FROM node:12
RUN \
    set -x \
    && apt-get update \
    && apt-get install -y net-tools build-essential valgrind

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN npm install -g nodemon
COPY . .
EXPOSE 8000
EXPOSE 10000-10100/udp
CMD ["npm", "run", "dev"]