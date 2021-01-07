# Microservices Security In Action
**By [Prabath Siriwardena](https://twitter.com/prabath) and [Nuwan Dias](https://twitter.com/nuwandias)**

<img src="cover.jpeg" style="float: left; width: 100%" />

[Amazon](https://www.amazon.com/Microservices-Security-Action-Prabath-Siriwardena/dp/1617295957/) | [Manning](https://www.manning.com/books/microservices-security-in-action) | [YouTube](https://www.youtube.com/channel/UCoEOYnrqEcANUgbcG-BuhSA) | [Slack](https://bit.ly/microservices-security) | [Notes](notes.md) | [Supplementary Readings](supplementary-readings.md)

**NOTE: While writing the book we wanted to mostly focus on the concepts, as the concrete technologies used to implement the concepts are constantly changing and we wanted to keep them as much as simple. So we decided to use Spring Boot to implement the OAuth 2.0 authorization server used in the samples of the book. However in practice you may use Keycloak, Auth0, Okta, WSO2, and so on as your authorization server.** 

**Spring Boot has deprecated AuthorizationServerConfigurerAdapter, ClientDetailsServiceConfigurer, and AuthorizationServerSecurityConfigurer classes, which we used to implement the authorization server, which we will surely update in the next edition of the book and will also update the github project even before that. However, we expect this will not distract the readers that much, because we don't expect them to implement an authorization server.**

## PART 1 OVERVIEW 
### 1 ■ Microservices security landscape
### 2 ■ [First steps in securing microservices](chapter02)
## PART 2 EDGE SECURITY 
### 3 ■ [Securing north/south traffic with an API gateway](chapter03)
### 4 ■ [Accessing a secured microservice via a single-page application](chapter04)
### 5 ■ [Engaging throttling, monitoring, and access control](chapter05)
## PART 3 SERVICE-TO-SERVICE COMMUNICATIONS 
### 6 ■ [Securing east/west traffic with certificates ](chapter06)
### 7 ■ [Securing east/west traffic with JWT](chapter07)
### 8 ■ [Securing east/west traffic over gRPC](chapter08)
### 9 ■ [Securing reactive microservices](chapter09)
## PART 4 SECURE DEPLOYMENT 
### 10 ■ [Conquering container security with Docker](chapter10)
### 11 ■ [Securing microservices on Kubernetes](chapter11)
### 12 ■ [Securing microservices with Istio service mesh](chapter12)
### PART 5 SECURE DEVELOPMENT 
### 13 ■ [Secure coding practices and automation](chaper13)
## APPENDICES
### A ■ OAuth 2.0 and OpenID Connect 
### B ■ [JSON Web Token](appendix-b)
### C ■ Single-page application architecture 
### D ■ Observability in a microservices deployment 
### E ■ [Docker fundamentals](appendix-e)
### F ■ [Open Policy Agent](appendix-f)
### G ■ Creating a certificate authority and related keys with OpenSSL 
### H ■ Secure Production Identity Framework for Everyone 
### I ■ [gRPC fundamentals](appendix-i)
### J ■ [Kubernetes fundamentals](appendix-j)
### K ■ [Service mesh and Istio fundamentals](appendix-k)

