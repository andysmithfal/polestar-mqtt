FROM node:20-alpine3.17
ENV TZ=Europe/London
RUN mkdir /app
COPY * /app
RUN cd /app && npm install
CMD cd /app && node app.js