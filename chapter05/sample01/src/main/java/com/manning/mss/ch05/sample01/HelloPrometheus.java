package com.manning.mss.ch05.sample01;

import io.prometheus.client.Counter;
import io.prometheus.client.Histogram;
import io.prometheus.client.spring.boot.EnablePrometheusEndpoint;
import io.prometheus.client.spring.boot.EnableSpringBootMetricsCollector;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
@EnablePrometheusEndpoint
@EnableSpringBootMetricsCollector
public class HelloPrometheus {

    static final Counter requests = Counter.build()
            .name("requests_total").help("Total number of requests.").register();

    static final Histogram requestLatency = Histogram.build()
            .name("requests_latency_seconds").help("Request latency in seconds.").register();

    public static void main(String[] args) throws Exception {
        SpringApplication.run(HelloPrometheus.class, args);
    }

    @RequestMapping ("/")
    String home() {
        requests.inc();
        // Start the histogram timer
        Histogram.Timer requestTimer = requestLatency.startTimer();
        try {
            return "Hello Prometheus!";
        } finally {
            // Stop the histogram timer
            requestTimer.observeDuration();
        }
    }

}
