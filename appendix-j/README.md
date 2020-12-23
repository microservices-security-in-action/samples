## Appendix J: Kubernetes fundamentals

[https://github.com/microservices-security-in-action/samples/tree/master/appendix-j](https://github.com/microservices-security-in-action/samples/tree/master/appendix-j)

## Notes

* **Page 500 / figure J.1**, top, right caption which points to kubectl box. In the caption it says kubelet, should be corrected as kubectl. 

## Supplementary Readings

We update this section as and when we find articles/blogs/videos related to the content discussed in this chapter.

* [Section J.2.3] Kubernetes uses itables to route traffic destined to a given service IP address to the corresponding pod. iptables is a user-space program providing a table-based system for defining rules for manipulating and transforming packets using the netfilter framework. This tutorial provides a very good intro to iptables and netfilter architecture: [A Deep Dive into Iptables and Netfilter Architecture](https://www.digitalocean.com/community/tutorials/a-deep-dive-into-iptables-and-netfilter-architecture)
* [Section J.4] This provides a comparision between different managed Kubernetes services offered by Google, Amazon, Microsoft, IBM, Digitalocean, Alibaba and so on: [Comparison of Kubernetes managed services](https://docs.google.com/spreadsheets/d/1RPpyDOLFmcgxMCpABDzrsBYWpPYCIBuvAoUQLwOGoQw/edit#gid=907731238)
* [Section J.18] Here is an excellent article that explains what happens during the creation and deletion of a Pod: [Graceful shutdown and zero downtime deployments in Kubernetes](https://learnk8s.io/graceful-shutdown)
* [Section J.18] kube-proxy operates in three modes to define routes to pods (userspace, iptables and IPVS), This artciles gives a very good caomparision between those three modes: [Comparing kube-proxy modes: iptables or IPVS?](https://www.projectcalico.org/comparing-kube-proxy-modes-iptables-or-ipvs/)
* [Minimum Viable Kubernetes](https://eevans.co/blog/minimum-viable-kubernetes/index.html)
* This is an excellent article written by Kevin Sookocheff on the Kubernetes network model: [A Guide to the Kubernetes Networking Model](https://sookocheff.com/post/kubernetes/understanding-kubernetes-networking-model/)
* There is no easy way to see network namespaces, as Kubernetes and Docker don’t register them (“ip netns” won’t work with Kubernetes and Docker). But we can use a few tricks discuss in this article to see, debug, manage and configure POD networking from the host: [A Hacker’s Guide to Kubernetes Networking](https://thenewstack.io/hackers-guide-kubernetes-networking/)
* [Deconstructing Kubernetes Networking](https://eevans.co/blog/deconstructing-kubernetes-networking/)

