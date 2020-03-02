FROM node:11.10-stretch

COPY ./ /app
WORKDIR /app

RUN npm install

RUN mkdir -p /app/logs && ln -snf /dev/stderr /app/logs/error.log 

EXPOSE 3000
CMD [ "npm", "start" ]