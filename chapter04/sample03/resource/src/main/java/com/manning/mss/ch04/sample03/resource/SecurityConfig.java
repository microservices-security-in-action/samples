package com.manning.mss.ch04.sample03.resource;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter;

@Configuration
public class SecurityConfig extends ResourceServerConfigurerAdapter {

    @Override
    public void configure(HttpSecurity http) throws Exception {
        http.anonymous().and().
                authorizeRequests().antMatchers("/.well-known/**").permitAll().
                and().authorizeRequests().antMatchers(HttpMethod.OPTIONS, "/*").permitAll().
                anyRequest().authenticated();

    }

}
