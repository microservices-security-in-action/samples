This is the second sample of chapter 4.

In this sample we use a Remote Resource Server to serve a list of orders to our SPA based on AngularJS. Follow the steps below to run the sample.

1) Execute the following command from your command line client to build the source.

[source]
--------
mvn clean install
--------

2) Once built, navigate to the 'resource' directory and execute the command below.

[source]
--------
mvn spring-boot:run
--------

3) On a new terminal window navigate to the 'ui' directory and execute the command below.

[source]
--------
mvn spring-boot:run
--------

4) On a private browser window go to the URL http://localhost:8080. You will see a message saying 'Login to see your orders'.

5) Press on the Login button and provide 'user' as the username and 'password' as the password and submit.

6) You should see a list of orders being displayed on a table. This information is fetched from the resource server running at localhost:9000. You can use the browser developer console's network tab to observe the request response data being exchanged between the UI application on localhost:8080 and the resource server on localhost:9000.
