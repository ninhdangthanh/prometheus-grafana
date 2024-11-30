#!/bin/bash

# Infinite loop to call the endpoint every 5 seconds
while true; do
  # Send a GET request to the endpoint
  curl -X GET http://localhost:8080/tweets
  
  # Wait for 5 seconds before the next request
  sleep 0.01
done
