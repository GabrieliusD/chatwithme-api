#!/bin/bash
set -e
cd /home/ec2-user/project

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" # loads nvm bash_copletion (node is in)

npm install
npm i -g pm2
pm2 start index.js --name "ChatApi"