# Microservices Security in Action ~ Supplementary Readings

We update this section as and when we find articles/blogs/videos related to the content discussed in this book.

<img src="cover.jpeg" style="float: left; width: 100%" />

[Amazon](https://www.amazon.com/Microservices-Security-Action-Prabath-Siriwardena/dp/1617295957/) | [Manning](https://www.manning.com/books/microservices-security-in-action) | [YouTube](https://www.youtube.com/channel/UCoEOYnrqEcANUgbcG-BuhSA) | [Slack](https://bit.ly/microservices-security) 

## Chapter 2: Securing north/south traffic with an API gateway

* [Advanced API Security: OAuth 2.0 and Beyond](https://www.amazon.com/Advanced-API-Security-OAuth-Beyond-ebook/dp/B082WRYJJM/) by [Prabath Siriwardena](https://twitter.com/prabath)

## Chapter 4: Accessing a secured microservice via a single-page application

* [Video] [Securing Single-page Applications with OpenID Connect](https://www.youtube.com/watch?v=tmKD2famPJc) by [Prabath Siriwardena](https://twitter.com/prabath)

## Chapter 10: Conquering container security with Docker

* [Book] [Container Security: Fundamental Technology Concepts that Protect Containerized Applications](https://www.amazon.com/Container-Security-Fundamental-Containerized-Applications/dp/1492056707/)

## Chapter 11: Securing microservices on Kubernetes

* This chapter mostly focuses on securing microservices in a Kubernetes deployment, and does not delve deep into a securing a Kubernetes deployment, which is in fact a book on it's own. The book [Learn Kubernetes Security](https://www.amazon.com/Learn-Kubernetes-Security-orchestrate-microservices/dp/1839216506/), published in July, 2020 carries a wealth of information with respet to securing a Kubernetes deployment.
* Each layer of the Cloud Native security model builds upon the next outermost layer. The Code layer benefits from strong base (Cloud, Cluster, Container) security layers: [Overview of Cloud Native Security](https://kubernetes.io/docs/concepts/security/overview/)
* [Video] [RBAC tooling](https://www.youtube.com/watch?v=ODTETX48yIU)
* [Video] [Role based access control (RBAC) policies in Kubernetes](https://www.youtube.com/watch?v=CnHTCTP8d48)

## Chapter 12: Securing microservices with Istio service mesh

* [Video] [Controlling Access to Your Microservices with Istio Service Mesh](https://www.youtube.com/watch?v=5MqSOnQ7ZGw) by [Prabath Siriwardena](https://twitter.com/prabath)
* [Video] [Securing gRPC Microservices with Istio Service Mesh](https://www.youtube.com/watch?v=g2fexevWS8A) by [Prabath Siriwardena](https://twitter.com/prabath)

## Appendix A: OAuth 2.0 and OpenID Connect

* [Video] [OAuth 2.0 Internals and Applications](https://www.youtube.com/watch?v=lv9sv-YTgMs) by [Prabath Siriwardena](https://twitter.com/prabath)
* [Video] [OpenID Connect Authentication Flows](https://www.youtube.com/watch?v=q3Nw8WlFsx0) by [Prabath Siriwardena](https://twitter.com/prabath)
* [Video] [OAuth 2 0 Threat Landscape](https://www.youtube.com/watch?v=FBFEuP5ZVj0) by [Prabath Siriwardena](https://twitter.com/prabath)
* [Video] [OAuth 2.0 with cURL](https://www.youtube.com/watch?v=xipHJSW93KI) by [Prabath Siriwardena](https://twitter.com/prabath)
* [Video] [OAuth 2.0 Token Introspection](https://www.youtube.com/watch?v=CuawoBrs_6k) by [Prabath Siriwardena](https://twitter.com/prabath)
* [Video] [OAuth 2.0 Token Revocation](https://www.youtube.com/watch?v=OEab8UoEUow) by [Prabath Siriwardena](https://twitter.com/prabath)
* [Video] [OAuth 2.0 Response Type vs. Grant Type](https://www.youtube.com/watch?v=Qdjuavr33E4) by [Prabath Siriwardena](https://twitter.com/prabath)
* [Video] [Proof Key for Code Exchange](https://www.youtube.com/watch?v=2pJShFKYoJc) by [Prabath Siriwardena](https://twitter.com/prabath)
* [Book] [OAuth 2.0 in Action](https://www.amazon.com/OAuth-2-Action-Justin-Richer/dp/161729327X/)

## Appendix B: JSON Web Token (JWT)

* [Video] [JSON Web Token Internals and Applications](https://www.youtube.com/watch?v=c-jsKk1OR24) by [Prabath Siriwardena](https://twitter.com/prabath)

## Appendix E: Docker fundamentals

* [Book] [Docker Deep Dive](https://www.amazon.com/Docker-Deep-Dive-Nigel-Poulton/dp/1521822808/)

## Appendix J: Kubenrnetes fundamentals

* [Section J.2.3] Kubernetes uses itables to route traffic destined to a given service IP address to the corresponding pod. iptables is a user-space program providing a table-based system for defining rules for manipulating and transforming packets using the netfilter framework. This tutorial provides a very good intro to iptables and netfilter architecture: [A Deep Dive into Iptables and Netfilter Architecture](https://www.digitalocean.com/community/tutorials/a-deep-dive-into-iptables-and-netfilter-architecture)
* [Section J.4] This provides a comparision between different managed Kubernetes services offered by Google, Amazon, Microsoft, IBM, Digitalocean, Alibaba and so on: [Comparison of Kubernetes managed services](https://docs.google.com/spreadsheets/d/1RPpyDOLFmcgxMCpABDzrsBYWpPYCIBuvAoUQLwOGoQw/edit#gid=907731238)
* [Section J.18] Here is an excellent article that explains what happens during the creation and deletion of a Pod: [Graceful shutdown and zero downtime deployments in Kubernetes](https://learnk8s.io/graceful-shutdown)
* [Section J.18] kube-proxy operates in three modes to define routes to pods (userspace, iptables and IPVS), This artciles gives a very good caomparision between those three modes: [Comparing kube-proxy modes: iptables or IPVS?](https://www.projectcalico.org/comparing-kube-proxy-modes-iptables-or-ipvs/)
* [Minimum Viable Kubernetes](https://eevans.co/blog/minimum-viable-kubernetes/index.html)
* This is an excellent article written by Kevin Sookocheff on the Kubernetes network model: [A Guide to the Kubernetes Networking Model](https://sookocheff.com/post/kubernetes/understanding-kubernetes-networking-model/)
* There is no easy way to see network namespaces, as Kubernetes and Docker don’t register them (“ip netns” won’t work with Kubernetes and Docker). But we can use a few tricks discuss in this article to see, debug, manage and configure POD networking from the host: [A Hacker’s Guide to Kubernetes Networking](https://thenewstack.io/hackers-guide-kubernetes-networking/)
* [Deconstructing Kubernetes Networking](https://eevans.co/blog/deconstructing-kubernetes-networking/)
* [Book] This is an execellent resource, which explains fundamental ingredients that help building Kubernetes. The book is not yet released, but you have access to the MEAP edition: [Core Kubernetes](https://www.manning.com/books/core-kubernetes)
* [Video] [Intro + Deep Dive: Kubernetes (Network) SIG](https://www.youtube.com/watch?v=BxDnv7MpJ0I)
* [Video] [A Deep Dive into Pod Readiness Gates for Service Health](https://www.youtube.com/watch?v=Vw9GmSeomFg)
* [Documentation] [Pod Lifecycle](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/)
* [Documentation] Sometimes it's necessary to inspect the state of an existing Pod, however, for example to troubleshoot a hard-to-reproduce bug. In these cases you can run an ephemeral container in an existing Pod to inspect its state and run arbitrary commands: [Ephemeral Containers](https://kubernetes.io/docs/concepts/workloads/pods/ephemeral-containers/)

## Appendix K: Service mesh and Istio fundamentals

* [Design Considerations at the Edge of the ServiceMesh](https://www.openshift.com/blog/design-considerations-at-the-edge-of-the-servicemesh)
* [Video] Talks in depth about the Istio architecture prior to Istio 1.5 (1hr version): [Life of a Packet through Istio](https://www.youtube.com/watch?v=oZrZlx2fmcM)
* [Video] Talks in depth about the Istio architecture prior to Istio 1.5 (2hr version): [Life of a Packet through Istio](https://www.youtube.com/watch?v=cB611FtjHcQ)
* [Book] The current edition of the book Istio Up & Running is mostlly applicable to < Istio 1.5: [Istio Up & Running](https://www.amazon.com/Istio-Running-Service-Connect-Control/dp/1492043788/)
* [Book] This book is only half-way completed by now. You have access to the MEAP edition: [Istio in Action](https://www.manning.com/books/istio-in-action). This video is based out of chapter 04 of the book: [Istio Ingress Gateway](https://www.youtube.com/watch?v=Pq3NzxrvBP8)
* [Video] [Practical Istio](https://www.youtube.com/watch?v=uRXzRfthYeU)
