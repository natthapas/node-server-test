FROM node:14
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3030
CMD ["npm","start"]
