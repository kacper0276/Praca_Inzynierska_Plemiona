# ETAP 1: Budowanie
FROM node:20-alpine as build

WORKDIR /src
RUN npm install -g @angular/cli 

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . ./
RUN ng build --configuration=production

FROM nginx:stable AS final

EXPOSE 80

COPY --from=build /src/dist/client/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]