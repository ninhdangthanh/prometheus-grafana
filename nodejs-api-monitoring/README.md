# monitoring-article

TS project for the next blog article about API Monitoring

## Content

- NodeJS Typescript API
- Prometheus metrics
- API response time
- Prometheus scraper
- Grafana dashboard

## Dashboard

NodeJS Application Dashboard : https://grafana.com/grafana/dashboards/11159

## Install

```sh
npm ci
```

## Dependencies

Postgres, Prometheus and Grafana are declared in the `docker-compose.yml` file.

```
docker compose up -d
```