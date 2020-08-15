## Chapter 11: Securing microservices on Kubernetes

<img src="../cover.jpeg" style="float: left; width: 100%" />

[Amazon](https://www.amazon.com/Microservices-Security-Action-Prabath-Siriwardena/dp/1617295957/) | [Manning](https://www.manning.com/books/microservices-security-in-action) | [YouTube](https://www.youtube.com/channel/UCoEOYnrqEcANUgbcG-BuhSA) | [Slack](https://bit.ly/microservices-security) | [Notes](../notes.md) | [Supplementary Readings](../supplementary-readings.md)

## Notes

* **Page 278***, under the section 11.3.3 (the last line) | reported by the authors.

> From the Kubernetes 1.7 release onward, etcd stores Secrets **only** in an encrypted format.

Should be corrected as:

> From the Kubernetes 1.7 release onward, etcd **supports storing** Secrets in an encrypted format.

> [Release notes of Kubernetes 1.7](https://groups.google.com/g/kubernetes-announce/c/NNVPGTyWAwg/m/hu58a661AAAJ?pli=1) <Br/>
> [Encrypting Secret Data at Rest](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/)

## Supplementary Readings

We update this section as and when we find articles/blogs/videos related to the content discussed in this chapter.

* This chapter mostly focuses on securing microservices in a Kubernetes deployment, and does not delve deep into a securing a Kubernetes deployment, which is in fact a book on it's own. The book [Learn Kubernetes Security](https://www.amazon.com/Learn-Kubernetes-Security-orchestrate-microservices/dp/1839216506/), published in July, 2020 carries a wealth of information with respet to securing a Kubernetes deployment.
