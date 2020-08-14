## Appendix J: Kubernetes fundamentals

[https://github.com/microservices-security-in-action/samples/tree/master/appendix-j](https://github.com/microservices-security-in-action/samples/tree/master/appendix-j)

## Supplementary Readings

We update this section as and when we find articles/blogs/videos related to the content discussed in this chapter.

* [Section J.4] This provides a comparision between different managed Kubernetes services offered by Google, Amazon, Microsoft, IBM, Digitalocean, Alibaba and so on: [Comparison of Kubernetes managed services](https://docs.google.com/spreadsheets/d/1RPpyDOLFmcgxMCpABDzrsBYWpPYCIBuvAoUQLwOGoQw/edit#gid=907731238)
* [Section J.18] Here is an excellent article that explains what happens during the creation and deletion of a Pod: [Graceful shutdown and zero downtime deployments in Kubernetes](https://learnk8s.io/graceful-shutdown)
* This is an excellent article written by Kevin Sookocheff on the Kubernetes network model: [A Guide to the Kubernetes Networking Model](https://sookocheff.com/post/kubernetes/understanding-kubernetes-networking-model/)
* There is no easy way to see network namespaces, as Kubernetes and Docker don’t register them (“ip netns” won’t work with Kubernetes and Docker). But we can use a few tricks discuss in this article to see, debug, manage and configure POD networking from the host: [A Hacker’s Guide to Kubernetes Networking](https://thenewstack.io/hackers-guide-kubernetes-networking/)

