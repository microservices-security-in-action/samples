This is the Order Microservice used for placing orders within the system

## Building the Project
```shell
mvn clean install
```

## Running the Order Service
```shell
java -jar target/order_service-1.0.jar
```

## Place a new order
Use the following curl command to place an order

```
curl -d "{\"orderId\": \"ORD0001\", \"items\": [{\"itemCode\": \"IT0001\", \"quantity\": 3}, {\"itemCode\": \"IT0004\", \"quantity\": 1}], \"shippingAddress\": \"No 4, Main Street, Colombo 1, Sri Lanka\"}" -H "Content-Type: application/json" http://localhost:8080/orders
```