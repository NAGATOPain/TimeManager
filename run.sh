#!/bin/bash
PORT=3000;

cd ~/Project/TimeManager/ ;

# Clean PORT
fuser -k -n tcp $PORT ;

cp ./models/data.db backup.db ;

if [[ $1 = 'reset' ]]; then
    rm -rf ./models/data.db;
fi

google-chrome http://localhost:$PORT;
npm start;
