# Microservices Security In Action
**By Prabath Siriwardena and Nuwan Dias**

## Part 1 Overview
### Chapter 1: Welcome to microservices security
* How security works in a monolithic application 
* Challenges of securing microservices 
* Key security funamentals 
* Edge security
* Securing service-to-service communication 
* Security in DevOps 
* Security code development lifecycle (SCDL) 
* Summary

### [Chapter 2: Hello World microservices security](https://github.com/microservices-security-in-action/samples/tree/master/chapter02)
* Your first microservice
* Setting up an OAuth 2.0 server 
* Securing a microservice with OAuth 2.0 
* Invoking a secured microservice with a client application 
* Authorization of requests based on OAuth 2.0 scopes
* Summary  

## Part 2 Edge Security
### [Chapter 3: Deploying a microservice behind an API gateway](https://github.com/microservices-security-in-action/samples/tree/master/chapter03)
* The need for an API gateway in a microservices architecture?
* Security at the edge
* How to pick the correct OAuth 2.0 grant type?
* Setting up an API gateway with Zuul
* Deploying a microservice behind Zuul
* Securing communication between Zuul and the microservice
* Summary

### [Chapter 4: Building a single-page application to talk to microservices](https://github.com/microservices-security-in-action/samples/tree/master/chapter04)
* Building a single-page app 
* Introducing an API gateway, and setting up cross-origin resource sharing (CORS)
* Securing a SPA with OpenID Connect 
* Federated authentication 
* Summary

### Chapter 5: Engaging throttling, monitoring and access control
* Engaging throttling at the API gateway with Zuul
* Monitoring & analytics with Prometheus and Grafana
* Enforce access control policies at the API gateway with Zuul and Open Policy Agent (OPA)
* Summary

## Part 3 Service to Service Communication
### [Chapter 6: Securing service-to-service communication with certificates](https://github.com/microservices-security-in-action/samples/tree/master/chapter06)
* Why use mTLS? 
* Creating certificates
* Securing microservices with TLS 
* Engaging mTLS
* Challenges in key management 
* Key rotation
* Monitoring key use 
* SPIFFE 
* Summary  
					
### [Chapter 7: Securing service-to-service communication with JWT](https://github.com/microservices-security-in-action/samples/tree/master/chapter07)
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

### Chapter 8: Securing service-to-service communication happens over gRPC
* Understanding gRPC 
* Service-to-service communications over gRPC 
* Securing gRPC service-to-service communications with mTLS 
* Securing gRPC service-to-service communications with JWT          
* Summary
					
### Chapter 9: Securing Event-driven microservices
* Why event-driven microservices?
* Setting up Kafka as a message broker in a microservices deployment
* Developing a microservice to push events to a topic in Kafka
* Developing a microservice to read events from a Kafka topic
* Using Transport Layer Security (TLS) to protect data in transit 
* Using mutual Transport Layer Security (mTLS) for authentication 
* Controlling access to Kafka topics with ACLs 
* Controlling access to Kafka topics with OPA          
* Summary									

## Part 4 Secure Deployment 
### Chapter 10: Conquering container security with Docker
* Docker security principles
* Deploying a microservice on Docker
* Securing the host
* Running Docker Bench for security
* Running Docker in Swarm mode
* Challenges in container security 
* Summary
					
### Chapter 11: Securing microservices on Kubernetes
* Setting up a Docker cluster with Kubernetes
* Kubernetes built in security features
* Setting up Kubernetes security policies
* Using Kubernetes network policies 
* Securing applications with Calico 
* Implementing security as a sidecar 
* Summary
	
### Chapter 12: Securing microservices with Istio service mesh
* Setting up Istio on Kubernetes 
* Istio authentication architecture 
* Securing service-to-service communication with mTLS 
* Securing service-to-service communication with JWT 
* Istio authorization architecture 
* Enabling authorization 
* Summary  

## Part 5 Secure Development 
### Chapter 13: Secure coding practices and automation
* OWASP API security top 10 
* Static code analysis vs. dynamic analysis
* Running static code analysis
* Running dependency checks
* Running dynamic analysis with OWASP ZAP 
* Integrating security testing with Jenkins 
* Summary  
