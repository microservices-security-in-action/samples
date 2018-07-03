Secured Hello World Service

## Building the Project
```shell
mvn clean install
```

## Running the Microservice

Note: If you are still running the Microservice from sample 'helloworld', you need to stop that first.
This can be done by pressing the CTRL (Command on Mac) + C on the terminal window that is running the Microservice.
```shell
java -jar target/secure-helloworld-1.0.jar
```

## Accessing the Microservice
First obtain an access token as specified in the sample 'oauth2_server'.

Use the access token as the Bearer header as below.

```
curl -v -H "Authorization: Bearer 705e6c9d-fc95-4181-af62-a18764ec1c56" 'http://localhost:8080/greetings/hello?name=Mark'
```