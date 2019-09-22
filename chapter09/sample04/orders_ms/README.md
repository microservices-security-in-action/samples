## Chapter 9: Orders microservice (event source to Kafka)

* To build the project with Maven, use the following command from within the sample01 directory.

```javascript
:\> mvn clean install
```

* You need to have Apache Kafka up and running for this microservice to run successfully.

* To spin up the microservice, run the following command from the sample01 directory.

```javascript
:\> mvn spring-boot:run
```

* Once the microservice has started it will create a topic named ORDERS in Kafka. 
You can view this topic by listing the available topics. Open up a Kafka consumer process and 
listen for messages on the ORDERS topic.

* Once the microservice is started execute the following cURL command to place an order
through the orders microservice.

```javascript
:\> curl http://localhost:8080/order -X POST -d @order.json -H "Content-Type: application/json" -v
```

* This command should return a 201 Created response. If you have a Kafka consumer listening on 
the ORDERS topic you should see the orders request payload being received on the topic.

