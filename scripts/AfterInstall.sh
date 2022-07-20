#!/bin/bash
set -e
cd /home/user-ec2/project
npm install
pm2 start index.js