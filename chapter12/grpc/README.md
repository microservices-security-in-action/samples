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
```javascript
127.0.0.1 gateway.ecomm.com
127.0.0.1 inventory.ecomm.com
```
* Run the gRPC client application with the following command from sample01 directory. The 80 is the node port of the Istio ingress gateway service running under the istio-system namespace.
```javascript
\> ./build/install/sample01/bin/inventory-client gateway.ecomm.com 80
```
# Enable TLS at the Istio Ingress Gateway

* Generate TLS keys for the Ingress Gateway using OpenSSL Docker container (run from sample01/k8s directory)
```javascript
\> docker run -it -v $(pwd):/export prabath/openssl

# openssl req -nodes -new -x509 -keyout /export/gateway-keys/server.key -out /export/gateway-keys/server.cert -subj "/CN=gateway.ecomm.com"
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
* Test the TLS connection with the gRPC client appliation (run from sample01 directory). Here we have to use the TLS port correponding to the Istio Ingress Gateway.
```javascript
\> ./build/install/sample01/bin/inventory-client gateway.ecomm.com 443 $(pwd)/k8s/gateway-keys/server.cert
```
# Deploy STS and Order Processing microservice (Order Processing service will act as a gRPC client to the Invetory gRPC service)

* Deploy STS  (run from sample01 directory).
```javascript
\> kubectl apply -f k8s/sts.yaml
```
* Deploy Order Processing microservice  (run from sample01 directory).
```javascript
\> kubectl apply -f k8s/orders.yaml
```
# Access Order Processing microservice with a JWT from the STS

* Get a JWT from the STS.
```javascript
curl -v -X POST --basic -u applicationid:applicationsecret \
-H "Content-Type: application/x-www-form-urlencoded;charset=UTF-8" \
-k -d "grant_type=password&username=peter&password=peter123&scope=foo" \
--resolve sts.ecomm.com:$INGRESS_HTTPS_PORT:$INGRESS_HOST \
https://sts.ecomm.com:$INGRESS_HTTPS_PORT/oauth/token
```
* Access Order Processing microservice with the JWT.
```javascript
\> export TOKEN=<jwt>
\> curl -k -v https://orders.ecomm.com:$INGRESS_HTTPS_PORT/orders \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
--resolve orders.ecomm.com:$INGRESS_HTTPS_PORT:$INGRESS_HOST \
-d @- << EOF
{
"customer_id":"101021",
"payment_method":{
"card_type":"VISA",
"expiration":"01/22",
"name":"John Doe",
"billing_address":"201, 1st Street, San Jose, CA"
},
"items":[
{
"code":"101",
"qty":1
},
{
"code":"103",
"qty":5
}
],
"shipping_address":"201, 1st Street, San Jose, CA"
}
EOF
```




