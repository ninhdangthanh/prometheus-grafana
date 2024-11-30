#!/bin/bash

# Infinite loop to call the endpoint every 5 seconds
while true; do
  # Send a POST request to the endpoint
  curl -X POST http://localhost:8080/tweets \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, this is a test tweet!"}'
    
  # Wait for 5 seconds before the next request
  sleep 0.1
done
