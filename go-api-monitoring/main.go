package main

import (
	"go-api-monitoring/monitoring"
	"go-api-monitoring/tweet"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func prometheusHandler() gin.HandlerFunc {
	h := promhttp.Handler()

	return func(c *gin.Context) {
		h.ServeHTTP(c.Writer, c.Request)
	}
}

func main() {
	gin.SetMode(gin.ReleaseMode)

	responseTimeCollector := monitoring.NewResponseTime()

	router := gin.Default()
	router.Use(cors.Default())

	router.GET("/tweets", func(c *gin.Context) {
		start := time.Now()
		var statusCode = http.StatusOK
		c.JSON(statusCode, "list tweets")
		diff := time.Now().Sub(start).Seconds() * 1000

		responseTimeCollector.Collect(c.Request.Method, c.Request.RequestURI, strconv.Itoa(statusCode), diff)
	})

	router.POST("/tweets", func(c *gin.Context) {
		start := time.Now()
		var input tweet.TweetRequest
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			diff := time.Now().Sub(start).Seconds() * 1000
			responseTimeCollector.Collect(c.Request.Method, c.Request.RequestURI, strconv.Itoa(http.StatusBadRequest), diff)
			return
		}
		c.JSON(http.StatusOK, input)
		diff := time.Now().Sub(start).Seconds() * 1000
		responseTimeCollector.Collect(c.Request.Method, c.Request.RequestURI, strconv.Itoa(http.StatusOK), diff)
	})

	router.GET("/metrics", prometheusHandler())

	router.Run(":8080")
}
