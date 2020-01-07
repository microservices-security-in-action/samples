## Chapter 9: Sample 05 - Using NATS for messaging

* Start the NATS docker image by executing the following command

```javascript
:\> docker run -p 4222:4222 -p 8222:8222 -p 6222:6222 --name nats-server -ti nats:latest
```

* Navigate to the 'natssub' directory and execute the following command to build the NATS subscriber

```javascript
:\> mvn clean install
```

* Once the build is successful execute the following command to run the NATS susbcriber

```javascript
:\> java -jar target/com.manning.mss.ch09.sample05.natssub-1.0.0.jar
```

* In a new terminal, navigate to the 'natspub' directory and execute the following command to build the NATS publisher.

```javascript
:\> mvn clean install
```
* Once the build is successful execute the following command to run the NATS publisher.

```javascript
:\> java -jar target/com.manning.mss.ch09.sample05.natspub-1.0.0.jar
```

* Observe the terminal on which you ran the NATS subscriber, you should see a message which says the following

```javascript
:\> Received message: Welcome to NATS
```

