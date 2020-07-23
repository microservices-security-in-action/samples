## Chapter 12: Securing microservices with Istio service mesh

[https://github.com/microservices-security-in-action/samples/tree/master/chapter12](https://github.com/microservices-security-in-action/samples/tree/master/chapter12)

## Errata

* Page 307, right after the 1st para. You do not need to run the following two commands, if you are using Istio 1.6.0+. Istio 1.6.0 enables SDS for Ingress Gateway by default | reported by authors

> \> istioctl manifest generate \
--set values.gateways.istio-ingressgateway.sds.enabled=true > \
istio-ingressgateway.yaml

> \> kubectl apply -f istio-ingressgateway.yaml
