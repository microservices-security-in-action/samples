package com.manning.mssecurity.helloworld;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@SpringBootApplication
public class HelloService {

    public static void main(String args[]) {
        
        SpringApplication.run(HelloService.class, args);
    }

    @RequestMapping("/hello")
    public String sayHello(@RequestParam("name") String name) {

        return "Hello " + (StringUtils.isEmpty(name) ? "Spring Boot!!" : name + "!!");
    }

}
