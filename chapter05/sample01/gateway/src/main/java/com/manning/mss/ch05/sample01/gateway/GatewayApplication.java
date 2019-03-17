package com.manning.mss.ch05.sample01.gateway;

import com.manning.mss.ch05.sample01.gateway.filters.OAuthFilter;
import com.manning.mss.ch05.sample01.gateway.filters.ThrottlingFilter;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.zuul.EnableZuulProxy;
import org.springframework.context.annotation.Bean;

@EnableZuulProxy
@SpringBootApplication
public class GatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }

    @Bean
    public OAuthFilter oAuthFilter(){
        return new OAuthFilter();
    }

    @Bean
    public ThrottlingFilter throttlingFilter() {
        return new ThrottlingFilter();
    }
}
