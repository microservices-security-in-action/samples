package com.manning.mss.ch02.sample03.service;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;
import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configurers.ResourceServerSecurityConfigurer;

@Configuration
@EnableResourceServer
public class ResourceServerConfig extends ResourceServerConfigurerAdapter {

    private static final String SECURED_READ_SCOPE = "#oauth2.hasScope('read')";

    private static final String SECURED_WRITE_SCOPE = "#oauth2.hasScope('write')";

    private static final String SECURED_PATTERN_WRITE = "/orders/**";

    private static final String SECURED_PATTERN_READ = "/orders/{id}";

    @Override
    public void configure(HttpSecurity http) throws Exception {
        http.requestMatchers()
                .antMatchers(SECURED_PATTERN_WRITE).and().authorizeRequests()
                .antMatchers(HttpMethod.POST, SECURED_PATTERN_WRITE).access(SECURED_WRITE_SCOPE)
                .antMatchers(HttpMethod.GET, SECURED_PATTERN_READ).access(SECURED_READ_SCOPE);
    }

    @Override
    public void configure(ResourceServerSecurityConfigurer resources) {
        resources.resourceId("sample-oauth");
    }
}
