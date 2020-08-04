# Notes

## Chapter 11

* Page 278/Section 11.3.3 (the last line).

> From the Kubernetes 1.7 release onward, etcd stores Secrets **only** in an encrypted format.

Should be corrected as:

> From the Kubernetes 1.7 release onward, etcd **supports storing** Secrets in an encrypted format.

** Release notes of Kubernetes 1.7: [https://groups.google.com/g/kubernetes-announce/c/NNVPGTyWAwg/m/hu58a661AAAJ?pli=1](https://groups.google.com/g/kubernetes-announce/c/NNVPGTyWAwg/m/hu58a661AAAJ?pli=1)
** [Encrypting Secret Data at Rest](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/)

## Chapter 12

* **Page 321**, section 12.4.3, listing 12.12.  Remove the label **app: inventory**. To striclty enforce mTLS for the Inventory microservice you can define another PeerAuthentication policy with that label. The samples git repo has the correct policy.

### Updates to the Istio 1.6.0 release <hr/>

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

## Appendix E

* **Page 414**, formatting issue on the last line of the code block. Should be corrected as: 
```yaml
docker-init:
  Version: 0.18.0
  Gitcommit: fec3683
```


