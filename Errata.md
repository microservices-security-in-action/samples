# Errata

## Chapter11

* Page 278/Section 11.3.3 (the last line) | reported by authors.

> From the Kubernetes 1.7 release onward, etcd stores Secrets **only** in an encrypted format.

Should be corrected as:

> From the Kubernetes 1.7 release onward, etcd **supports storing** Secrets in an encrypted format.

## Chapter12

* Page 307, right after the 1st para. You do not need to run the following command, if you are using Istion 1.6.0+. Istio 1.6.0 enables SDS for Ingress Gateway by default | reported by authors

> \> istioctl manifest generate \
--set values.gateways.istio-ingressgateway.sds.enabled=true > \
istio-ingressgateway.yaml

