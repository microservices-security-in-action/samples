## Chapter 9: Order History Microservice

* To build the project with Maven, use the following command from within the sample01 directory.

```javascript
:\> mvn clean install
```

* You need to have Apache Kafka up and running for this microservice to run successfully.

* You also need to have the Orders microservice from sample01 up and running. The Orders 
microservice will be the event source for this (Buying History) microservice. 

* To spin up the microservice, run the following command from the sample02 directory.

```javascript
:\> mvn spring-boot:run
```

* Once the microservice has started it will subscribe to a topic named ORDERS in Kafka.

* Execute the following cURL command to place an order through the orders microservice of 
sample01

```javascript
:\> curl http://localhost:8080/order -X POST -d @order.json -H "Content-Type: application/json" -v
```

* This command should return a 201 Created response.

* Once the order has been received by the Orders microservice, it will push an event to the 
ORDERS topic on Kafka. This microservice would receive this event and print a message on 
the console saying,

```javascript
Updated buying history of customer with order: <order_id>
```