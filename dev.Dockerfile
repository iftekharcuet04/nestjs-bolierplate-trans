FROM node:20

RUN npm install -g pnpm

# fix sharp memory leak
RUN apt-get update && apt-get install -y libjemalloc2
ENV LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libjemalloc.so.2

WORKDIR /app

USER node