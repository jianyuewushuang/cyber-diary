#!/bin/bash
npm run build
npm run dev
sleep 1
xdg-open "http://localhost:8080"
