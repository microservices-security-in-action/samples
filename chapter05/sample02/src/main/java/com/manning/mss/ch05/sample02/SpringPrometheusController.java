package com.manning.mss.ch05.sample02;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SpringPrometheusController {

    @GetMapping("/")
    public String root() {
        return "Hello Prometheus";
    }

}
