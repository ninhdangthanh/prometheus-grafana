package monitoring

import (
	"github.com/prometheus/client_golang/prometheus"
)

type ResponseTime struct {
	responseTimeHistogram *prometheus.HistogramVec
}

func (resp *ResponseTime) Collect(method string, route string, code string, responseTime float64) {
	resp.responseTimeHistogram.With(prometheus.Labels{
		"method": method,
		"route":  route,
		"code":   code,
	}).Observe(responseTime)
}

func NewResponseTime() *ResponseTime {
	responseTimeHistogram := prometheus.NewHistogramVec(prometheus.HistogramOpts{
		Name:    "http_request_duration_ms",
		Help:    "Duration of HTTP requests in ms",
		Buckets: []float64{.1, 5, 15, 50, 100, 200, 300, 400, 500, 1000},
	}, []string{"method", "route", "code"})
	prometheus.MustRegister(responseTimeHistogram)
	return &ResponseTime{
		responseTimeHistogram,
	}
}
