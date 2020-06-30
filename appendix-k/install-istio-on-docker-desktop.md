
# Installing Istio on Docker Desktop

This explains how to install Istio on Docker Desktop.

## Prerequsites
* Make sure Docker Desktop is running with Kubernetes enbled.
![alt text](./k8s-on-docker-desktop.png "K8S on Docker Desktop")
* If you don't have Docker Desktop installed, please follow [these](https://docs.docker.com/desktop/) instucions to install.

## Installing Istio
* Download the latest version of Istion (at the time of this writing it is 1.6.3)

```javascript
\> curl -L https://istio.io/downloadIstio | sh -
```
* Update the PATH environment variable
```javascript
\> cd istio-1.6.3
\> export PATH=$PWD/bin:$PATH
```
* Install all the Istio features with the demo profile (Only on Istio 1.6.0+)
```javascript
\> istioctl install --set profile=demo
```
* Install all the Istio features with the demo profile (Only on Istio < 1.6.0)
```javascript
\> for i in install/kubernetes/helm/istio-init/files/crd*yaml;do kubectl apply -f $i; done
\> kubectl apply -f install/kubernetes/istio-demo.yaml
```
* Enable auto-injection.
```javascript
\> kubectl label namespace default istio-injection=enabled
```

## Uninstalling Istio
```javascript
\> istioctl manifest generate --set profile=demo | kubectl delete -f -
\> kubectl delete namespace istio-system
```
