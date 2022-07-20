#!/bin/bash
set -e
cd /home/ec2-user/project
npm install
pm2 start index.js