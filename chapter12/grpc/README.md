**NOTE**: *This sample is not covered in the book. This video explains the steps you need to carry out to run this sample: [https://www.youtube.com/watch?v=g2fexevWS8A](https://www.youtube.com/watch?v=g2fexevWS8A).*

# Tryout gRPC microservice with no TLS enabled at the Istio Ingress Gateway

* Run the following command from the sample01 directory to create a Gateway resource.
```javascript
\> kubectl apply -f k8s/gateway-notls.yaml
```
* Run the following command from the sample01 directory to create inventory-deployment deployment, inventory-service kubernetes service amd ecomm-virtual-service virtual services.
```javascript
\> kubectl apply -f k8s/inventory.yaml

deployment.apps/inventory-deployment created
service/inventory-service created
virtualservice.networking.istio.io/ecomm-virtual-service created
```
* To build the gRPC client application run the following command from sample01 directory.
```javascript
\> ./gradlew installDist
```
* Make sure you have following entries in the /etc/hosts file, where the IP address points to the external IP address of the Istio Ingress Gateway. 

127.0.0.1 gateway.ecomm.com
127.0.0.1 inventory.ecomm.com

* Run the gRPC client application with the following command from sample01 directory. The 80 is the node port of the Istio ingress gateway service running under the istio-system namespace.

./build/install/sample01/bin/inventory-client gateway.ecomm.com 80

# Enable mTLS at the Istio Ingress Gateway

* Generate TLS keys for the Ingress Gateway using OpenSSL Docker container (run from sample01/k8s directory)
```javascript
\> docker run -it -v $(pwd):/export prabath/openssl

# openssl req  -nodes -new -x509 -keyout /export/gateway-keys/server.key -out /export/gateway-keys/server.cert -subj "/CN=gateway.ecomm.com"
# exit
```
* Create a TLS secret under istio-system namespace, where the Gateway resource is created (run from sample01/k8s directory)
```javascript
\> kubectl create -n istio-system secret tls  ecomm-credential --key=gateway-keys/server.key --cert=gateway-keys/server.cert
```
* Update Gateway resource to enforce TLS (run from sample01 directory)
```javascript
\> kubectl apply -f k8s/gateway.yaml
```





