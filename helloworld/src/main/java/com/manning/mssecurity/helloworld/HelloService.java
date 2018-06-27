package com.manning.mssecurity.helloworld;

import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/hello")
public class HelloService {

    @GetMapping
    public String sayHello(@RequestParam("name") String name) {

        return "Hello " + (StringUtils.isEmpty(name) ? "Spring Boot!!" : name + "!!");
    }

}
