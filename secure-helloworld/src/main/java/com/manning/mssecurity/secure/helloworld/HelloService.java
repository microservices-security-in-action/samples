package com.manning.mssecurity.secure.helloworld;

import org.springframework.context.annotation.Bean;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;
import org.springframework.security.oauth2.provider.authentication.OAuth2AuthenticationManager;
import org.springframework.security.oauth2.provider.token.RemoteTokenServices;
import org.springframework.security.oauth2.provider.token.ResourceServerTokenServices;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@EnableResourceServer
@EnableWebSecurity
@RestController
@RequestMapping("/greetings")
public class HelloService extends WebSecurityConfigurerAdapter {

    @GetMapping("/hello")
    public String sayHello(@RequestParam("name") String name) {

        String greet = StringUtils.isEmpty(name) ? "Spring Boot" : name;
        return "Hello " + greet + "!!";
    }

    @Bean
    public ResourceServerTokenServices tokenServices() {
        RemoteTokenServices tokenServices = new RemoteTokenServices();
        tokenServices.setClientId("applicationid");
        tokenServices.setClientSecret("applicationsecret");
        tokenServices.setCheckTokenEndpointUrl("http://localhost:8085/oauth/check_token");
        return tokenServices;
    }

    @Override
    public AuthenticationManager authenticationManagerBean() {
        OAuth2AuthenticationManager authenticationManager = new OAuth2AuthenticationManager();
        authenticationManager.setTokenServices(tokenServices());
        return authenticationManager;
    }

}
