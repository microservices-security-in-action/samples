* **NOTE**: This sample is not covered in the book. This videos explains the steps you need to carry out to run this samples: [https://www.youtube.com/watch?v=g2fexevWS8A](https://www.youtube.com/watch?v=g2fexevWS8A).

# Tryout gRPC microservice with no TLS enabled at the Istio Ingress Gateway

* Run the following commands from the sample01 directory to create a Gateway resource.

\> kubectl apply -f k8s/gateway-notls.yaml

* Run the following commands from the sample01 directory to create inventory-deployment deployment, inventory-service kubernetes service amd ecomm-virtual-service virtual services.

\> kubectl apply -f k8s/inventory.yaml

deployment.apps/inventory-deployment created
service/inventory-service created
virtualservice.networking.istio.io/ecomm-virtual-service created

