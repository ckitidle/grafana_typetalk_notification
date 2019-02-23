FROM node:11.10-stretch

COPY ./ /app
WORKDIR /app

RUN npm install

EXPOSE 3000
CMD [ "node", "index.js" ]