## Chapter 12: Securing microservices with Istio service mesh

[https://github.com/microservices-security-in-action/samples/tree/master/chapter12](https://github.com/microservices-security-in-action/samples/tree/master/chapter12)

## Errata

### Updates to the Istio 1.6.0 release. <hr/>

* **Page 321**, section 12.4.3, listing 12.12.  Remove the label **app: inventory**. To striclty enforce mTLS for the Inventory microservice you can define another PeerAuthentication policy with that label. The samples git repo has the correct policy.

* **Page 307**, right after the 1st para. You do not need to run the following two commands, if you are using Istio 1.6.0+. Istio 1.6.0 enables SDS for Ingress Gateway by default.

> \> istioctl manifest generate \
--set values.gateways.istio-ingressgateway.sds.enabled=true > \
istio-ingressgateway.yaml

> \> kubectl apply -f istio-ingressgateway.yaml

* **Page 308**, at the bottom of the page, foootnote 2.
> Even though SDS is enabled by default since Istio 1.5.0, the Istio Ingress gateway still does not use SDS by
default.

Should be updated to reflect the changes introduced in Istio 1.6.0

> Even though SDS is enabled by default since Istio 1.5.0, only in Istio 1.6.0 the Istio Ingress gateway uses SDS by
default. Istio 1.5.0 only enables SDS by default for the service proxies.

* **Page 311**, towards the end of the page, you do not need to run the following command in Istio 1.6.0. As the Note says on the same, Policy CRD was removed from Istio 1.6.0.
> \> kubectl apply -f authentication.policy.yaml

If you want to disable TLS between the Istio ingress gateway running in the istio-system namespace and all the services in the default namespace, you can use the following DestinationRule.
```yaml
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: disable-mtls
  namespace: istio-system
spec:
  host: inventory-service.default.svc.cluster.local
  trafficPolicy:
    tls:
      mode: DISABLE
```

* **Page 317**. If you are using Istio 1.6.0, you need to skip the section 12.4.1 and directly move to section 12.4.3. Istio 1.6.0 removed the Policy CRD.

