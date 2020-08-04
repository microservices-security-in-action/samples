## Chapter 11: Securing microservices on Kubernetes

[https://github.com/microservices-security-in-action/samples/tree/master/chapter11](https://github.com/microservices-security-in-action/samples/tree/master/chapter11)

## Notes

* **Page 278***, under the section 11.3.3 (the last line) | reported by the authors.

> From the Kubernetes 1.7 release onward, etcd stores Secrets **only** in an encrypted format.

Should be corrected as:

> From the Kubernetes 1.7 release onward, etcd **supports storing** Secrets in an encrypted format.

> [Release notes of Kubernetes 1.7](https://groups.google.com/g/kubernetes-announce/c/NNVPGTyWAwg/m/hu58a661AAAJ?pli=1) <Br/>
> [Encrypting Secret Data at Rest](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/)
