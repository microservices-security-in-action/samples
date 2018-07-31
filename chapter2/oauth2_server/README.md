Sample OAuth2 server for Spring Boot which uses an in-memory token store

The requesting method for token supports both ```json format``` and ```url-encoded format```


The token validity is currently 300 seconds (5 minutes).


Update any of the ```applicationid```/```applicationsecret```/```tokenValidity``` to however you want.

## Building the Project
```shell
mvn clean install
```

## Running the OAuth2 server
```shell
java -jar target/oauth2-server-1.0.jar
```

## Request new access token
Use any of the curl commands to request an access token.

#### Using URL-Encoded Format
```
curl -X POST -u applicationid:applicationsecret -v 'http://localhost:8085/oauth/token?grant_type=client_credentials&scopes=read%20write'
```

#### Using JSON Format
```
curl -u applicationid:applicationsecret -H "Content-Type: application/json" -d '{ "grant_type": "client_credentials", "scopes": "read write" }' -v 'http://localhost:8085/oauth/token'
```