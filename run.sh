#!/bin/bash
PORT=3000;

cd ~/Project/TimeManager/ ;
fuser -k -n tcp $PORT ;

if [[ $1 = 'reset' ]]; then
    rm -rf ./models/data.db;
fi

google-chrome http://localhost:$PORT;
npm start;
