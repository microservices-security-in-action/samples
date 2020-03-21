package com.manning.mss.ch04.sample03.resource.entities;

public class OIDCConfig {

    private String token_endpoint;

    private String issuer;

    private String authorization_endpoint;

    private String userinfo_endpoint;

    public String getToken_endpoint() {

        return token_endpoint;
    }

    public void setToken_endpoint(String token_endpoint) {

        this.token_endpoint = token_endpoint;
    }

    public String getIssuer() {

        return issuer;
    }

    public void setIssuer(String issuer) {

        this.issuer = issuer;
    }

    public String getAuthorization_endpoint() {

        return authorization_endpoint;
    }

    public void setAuthorization_endpoint(String authorization_endpoint) {

        this.authorization_endpoint = authorization_endpoint;
    }

    public String getUserinfo_endpoint() {

        return userinfo_endpoint;
    }

    public void setUserinfo_endpoint(String userinfo_endpoint) {

        this.userinfo_endpoint = userinfo_endpoint;
    }
}
