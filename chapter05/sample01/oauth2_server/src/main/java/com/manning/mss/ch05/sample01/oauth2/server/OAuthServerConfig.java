package com.manning.mss.ch05.sample01.oauth2.server;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.config.annotation.configurers.ClientDetailsServiceConfigurer;
import org.springframework.security.oauth2.config.annotation.web.configuration.AuthorizationServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableAuthorizationServer;
import org.springframework.security.oauth2.config.annotation.web.configurers.AuthorizationServerEndpointsConfigurer;
import org.springframework.security.oauth2.config.annotation.web.configurers.AuthorizationServerSecurityConfigurer;
import org.springframework.security.oauth2.provider.token.TokenStore;

@Configuration
@EnableAuthorizationServer
public class OAuthServerConfig extends AuthorizationServerConfigurerAdapter {

    private TokenStore tokenStore;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    public OAuthServerConfig(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void configure(AuthorizationServerEndpointsConfigurer endpoints) throws Exception {
        endpoints
                .authenticationManager(authenticationManager)
                .approvalStoreDisabled()
                .tokenStore(tokenStore);
    }

    @Override
    public void configure(ClientDetailsServiceConfigurer clients) throws Exception {
        clients.inMemory()
            .withClient("application1").secret(passwordEncoder.encode("application1secret"))
                .authorizedGrantTypes("client_credentials", "password")
                .scopes("read", "write")
                .accessTokenValiditySeconds(3600)
                .resourceIds("sample-oauth")
            .and()
            .withClient("application2").secret(passwordEncoder.encode("application2secret"))
                .authorizedGrantTypes("client_credentials", "password")
                .scopes("read")
                .accessTokenValiditySeconds(3600)
                .resourceIds("sample-oauth");
    }

    @Override
    public void configure(AuthorizationServerSecurityConfigurer security) throws Exception {
        security
                .checkTokenAccess("isAuthenticated()")
                .allowFormAuthenticationForClients();
    }

}
