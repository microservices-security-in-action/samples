## Chapter 12: Securing microservices with Istio service mesh

<img src="../cover.jpeg" style="float: left; width: 100%" />

[Amazon](https://www.amazon.com/Microservices-Security-Action-Prabath-Siriwardena/dp/1617295957/) | [Manning](https://www.manning.com/books/microservices-security-in-action) | [YouTube](https://www.youtube.com/channel/UCoEOYnrqEcANUgbcG-BuhSA) | [Slack](https://bit.ly/microservices-security) | [Notes](../notes.md) | [Supplementary Readings](../supplementary-readings.md)

## Notes

* **Page 321**, section 12.4.3, listing 12.12.  Remove the label **app: inventory**. To striclty enforce mTLS for the Inventory microservice you can define another PeerAuthentication policy with that label. The samples in the git repo has the correct policy.

### Updates to the Istio 1.6.0 release. <hr/>

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
  host: *.default.svc.cluster.local
  trafficPolicy:
    tls:
      mode: DISABLE
```
* **Page 312**, figure 12.4, shows the  default behavior of Istio versions before 1.5.0. With Istio 1.5.0+ if we do not specifically ask Istio not to use TLS between the Ingress Gateway and the microservices, the communications between the Ingress Gateway and STS / Order Processing microservices will be on HTTPS (arrows 1, 2 from the Istio Ingress Gateway), and also the communication between the Order Process and the Inventory microservices (arrow 3) will also be on HTTPS. 

* **Page 317**. If you are using Istio 1.6.0, you need to skip the section 12.4.1 and directly move to section 12.4.3. Istio 1.6.0 removed the Policy CRD.

## Supplementary Readings

We update this section as and when we find articles/blogs/videos related to the content discussed in this chapter.

* [Video][Controlling Access to Your Microservices with Istio Service Mesh](https://www.youtube.com/watch?v=5MqSOnQ7ZGw) by [Prabath Siriwardena](https://twitter.com/prabath)
* [Video][Securing gRPC Microservices with Istio Service Mesh](https://www.youtube.com/watch?v=g2fexevWS8A) by [Prabath Siriwardena](https://twitter.com/prabath)

