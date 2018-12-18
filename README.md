# Microservices Security In Action
**By Prabath Siriwardena and Nuwan Dias**

## Part 1 Overview
**Chapter 1: Welcome to microservices security**
* How security works in a monolithic application 
* Challenges of securing microservices 
* Key security funamentals 
* Edge security
* Securing service-to-service communication 
* Security in DevOps 
* Security code development lifecycle (SCDL) 
* Summary

**Chapter 2: Hello World microservices security**
* Your first microservice - 4
* Setting up an OAuth 2.0 server  - 6
* Securing a microservice with OAuth 2.0 – 5
2.4 Invoking a secured microservice with a client application – 4
* Authorization of requests based on OAuth 2.0 scopes
* Summary  

## Part 2 Edge Security
**Chapter 3: Deploying a microservice behind an API gateway**
* The need for an API gateway in a microservices architecture?
* Security at the edge
* How to pick the correct OAuth 2.0 grant type?
* Setting up an API gateway with Zuul
* Deploying a microservice behind Zuul
* Securing communication between Zuul and the microservice
* Summary

**Chapter 4: Building a single-page application to talk to microservices**
* Building a single-page app 
* Introducing an API gateway, and setting up cross-origin resource sharing (CORS)
* Securing a SPA with OpenID Connect 
* Federated authentication 
* Summary

**Chapter 5: Engaging throttling, monitoring and access control**
* Engaging throttling at the API gateway with Zuul
* Monitoring & analytics with Prometheus and Grafana
* Enforce access control policies at the API gateway with Zuul and Open Policy Agent (OPA)
* Summary

## Part 3 Service to Service Communication
**Chapter 6: Securing service-to-service communication with certificates**
* Why use mTLS? 
* Creating certificates
* Securing microservices with TLS 
* Engaging mTLS
* Challenges in key management 
* Key rotation
* Monitoring key use 
* SPIFFE -
* Summary  
					
**Chapter 7: Securing service-to-service communication with JWT**
* What is a JSON Web Token (JWT)? 
* What does a JWT look like? 
* JSON Web Signature (JWS) 
* JSON Web Encryption (JWE)
* Use cases for securing microservices with JWT 
* Setting up an STS to issue JWTs 
* Securing microservices with JWT
* Using JWT as a data source to do access control
* Securing service-to-service communication with JWT
* Exchanging a JWT for a new one with a new audience
* Summary  
					
**Chapter 8: Securing Event-driven Microservices**
* Setting up Kafka 
* Building a publisher microservice with Kafka 
* Building a consumer microservice with Kafka 
* Securing access to Kafka 
* Setting OPA over Kafka 
* Summary									

Part 3 Secure Deployment 
9. Conquering container security with Docker
9.1 Docker security principles - 5
9.2 Deploying a microservice on Docker - 6
9.3 Securing the host - 5
9.4 Running Docker bench for security - 5
9.5 Challenges in container security - 7
9.6 Summary
Total Pages = (Topic 5 => 8 * 3 = 24
Topic 6 => 10 * 1 = 10
Topic 7 => 15 * 1 = 15
Overview + Summary => 2
=> 51)					
10. Securing microservices on Kubernetes
            10.1 Overview 
10.2 Setting up a Docker cluster with Kubernetes - 6
10.3 Kubernetes built in security features - 5
10.4 Setting up Kubernetes security policies - 5
10.5 Using Kubernetes network policies - 5
10.6 Securing applications with Calico - 5
10.7 Implementing security as a sidecar - 6
10.8 Summary
Total Pages = (Topic 5 => 8 * 5 = 40
Topic 6 => 10 * 2 = 20
Overview + Summary  => 2
⇨	62)	
11. Securing microservices with Istio service mesh
11.1 Setting up Istio on Kubernetes - 5
11.2 Istio authentication architecture - 5
11.3 Securing service-to-service communication with mTLS - 6
11.4 Securing service-to-service communication with JWT - 6
11.5 Istio athorization architecture – 5
11.6 Enabling authorization 
11.7 Summary  
Total Pages = (Topic 5 => 8 * 3 = 24
Topic 6 => 10 * 2 = 20
Overview + Summary  => 2
=> 46)

Part 4 Secure Development 
12. Secure coding
11.1 OWASP top 10 most critical web application security risks - 6
11.2 Static code analysis vs. dynamic analysis - 5
11.3 Running static code analysis - 5
11.4 Running dependency checks - 5
11.5 Running dynamic analysis with OWASP ZAP - 6
11.6 Integrating security testing with Jenkins - 5
11.7 Summary  
Total Pages = (Topic 5 => 8 * 4 = 32
Topic 6 => 10 * 2 = 20
Overview + Summary  => 2
=> 54)


