# Microservices Security In Action
## By Prabath Siriwardena and Nuwan Dias

Part 1 Overview
1. Welcome to microservices security
1.1 How security works in a monolithic application 
1.2 Challenges of securing microservices - 5
1.3 Key security funamentals  - 5
1.4 Edge security
1.5 Securing service-to-service communication - 3
1.6 Security in DevOps - 3
1.7 Security code development lifecycle (SCDL) - 3
1.8 Summary
Total Pages = (Topic 3 => 4 * 4 = 16
Topic 5 => 8 * 2 = 16
Overview + Summary => 2
=> 34)
2. Hello World microservices security
2.1 Your first microservice - 4
2.2 Setting up an OAuth 2.0 server  - 6
2.3 Securing a microservice with OAuth 2.0 – 5
2.4 Invoking a secured microservice with a client application – 4
2.5 Authorization of requests based on OAuth 2.0 scopes
2.6 Summary  
Total Pages = (Topic 4 => 6 * 2 = 12
Topic 5 => 8 * 1 = 8
Topic 6 => 10 * 1 = 10
Overview + Summary => 2
=> 32)

Part 2 Edge Security
3. Deploying a microservice behind an API gateway
3.1 The need for an API gateway in a microservices architecture? – 4
3.2 Security at the edge
3.3 How to pick the correct OAuth 2.0 grant type? - 6
3.4 Setting up an API gateway with Zuul - 4
3.5 Deploying a microservice behind Zuul - 4
3.6 Securing communication between Zuul and the microservice. - 5
3.7 Summary
Total Pages = (Topic 3 => 4 * 1 = 4
Topic 4 => 6 * 3 = 18
Topic 5 => 8 * 1 = 8
Topic 6 => 10 * 1 = 10
Overview + Summary => 2
=> 42)
4. Building a single-page app to talk to microservices
4.1 Building a single-page app – 6
4.2 Introducing an API gateway, and setting up cross-origin resource sharing (CORS)
4.3 Securing a SPA with OpenID Connect - 6
4.4 Federated authentication - 5
4.5 Summary
Total Pages = (Topic 5 => 8 * 2 = 16
Topic 6 => 10 * 2 = 20
Overview + Summary => 2
=> 38)
5. Engaging throttling, monitoring and access control
5.1 Engaging throttling at the API gateway with Zuul- 5
5.2 Monitoring & analytics with Prometheus and Grafana- 5
5.3 Enforce access control policies at the API gateway with Zuul and Open Policy Agent (OPA) - 5
5.4 Summary
Total Pages = (Topic 5 => 8 * 4 = 32
Topic 6 => 10 * 2 = 20
Overview + Summary => 2
=> 54)

Part 2 Service to Service Communication
6. Securing service-to-service communication with certificates
            6.1 Why use mTLS? 
            6.2 Creating certificates - 5
6.3 Securing microservices with TLS - 5
6.4 Engaging mTLS - 5
6.5  Challenges in key management - 5
6.6 Key rotation - 6
6.7 Monitoring key use - 5 
6.8 SPIFFE - 5
6.9 Summary  
Total Pages = (Topic 5 => 8 * 6 = 48
Topic 6 => 10 * 1 = 10
Overview + Summary => 2
=> 60)					
7. Securing service-to-service communication with JWT
7.1 What is a JSON Web Token (JWT)? - 5
7.2 What does a JWT look like? - 6
7.3 JSON Web Signature (JWS) – 7
7.4 JSON Web Encryption (JWE)
7.5 Use cases for securing microservices with JWT - 5
7.6 Setting up an STS to issue JWTs - 5
7.7 Securing microservices with JWT – 7
7.8 Using JWT as a data source to do access control
7.9 Securing service-to-service communication with JWT
7.10 Exchanging a JWT for a new one with a new audience
7.11 Summary  
Total Pages = (Topic 5 => 8 * 3 = 24
Topic 6 => 10 * 1 = 10
Topic 7 => 15 * 2 = 30
Overview + Summary => 2
=> 66)					
8. Securing Event-driven Microservices
           8.1 Setting up Kafka - 4
           8.2 Building a publisher microservice with Kafka - 5
           8.3 Building a consumer microservice with Kafka - 5
           8.4 Securing access to Kafka - 5
           8.5 Setting OPA over Kafka - 6
           8.6 Summary


          Total Pages = (Topic 4 => 6 * 1 = 6
                                   Topic 5 => 8 * 3 = 24
                                   Topic 6=> 10 * 1 = 10
           Overview + Summary => 2
=> 42)										

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


