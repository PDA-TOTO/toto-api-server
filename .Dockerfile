FROM node

RUN mkdir /app
WORKDIR /app
COPY . /app

RUN npm install
RUN npm run build

EXPOSE 3333
ENTRYPOINT [ "node", "./dist/app.js" ]