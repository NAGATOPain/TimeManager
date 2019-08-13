#!/bin/bash
PORT=3000;

if [[ $1 = 'reset' ]]; then
    rm -rf ./models/data.db;
fi

sudo fuser -k $PORT/tcp;
google-chrome http://localhost:$PORT;
npm start;
