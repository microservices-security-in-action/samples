
##### CERTIFICATE AUTHORITY #####

#Generates a private key for the certificate authority
openssl genrsa -aes256 -passout pass:"manning123" -out /export/ca/ca_key.pem 4096

#Generates a public key for the certificate authority
openssl  req -new -passin pass:"manning123" -key /export/ca/ca_key.pem -x509 -days 365 -out /export/ca/ca_cert.pem -subj "/CN=ca.ecomm.com"

keytool -import -storepass manning123 -noprompt -file /export/ca/ca_cert.pem -alias ca -keystore /export/ca/truststore.jks

##### KAFKA SERVER #####e

#Generates a private key for the Kafka server
openssl genrsa -aes256 -passout pass:"manning123" -out /export/kafka_server/kafka_key.pem 4096

#Generates certificate signing request (CSR) for the Kafka server 
openssl req -passin pass:"manning123" -new -key /export/kafka_server/kafka_key.pem -out /export/kafka_server/csr-for-kafka -subj "/CN=kafka.ecomm.com"

#Generates Kafka server’s certificate, which is signed by the CA	
openssl x509 -req -passin pass:"manning123" -days 365 -in /export/kafka_server/csr-for-kafka -CA /export/ca/ca_cert.pem -CAkey /export/ca/ca_key.pem -set_serial 01 -out /export/kafka_server/kafka_cert.pem

#Creates a Java keystore with Kafka server’s private/public keys
openssl rsa -passin pass:"manning123" -in /export/kafka_server/kafka_key.pem -out /export/kafka_server/kafka_key.pem

cat /export/kafka_server/kafka_key.pem /export/kafka_server/kafka_cert.pem >> /export/kafka_server/kafka_keys.pem

openssl pkcs12  -export -passout pass:"manning123" -in /export/kafka_server/kafka_keys.pem -out /export/kafka_server/kafka.p12

keytool -importkeystore -srcstorepass manning123 -srckeystore /export/kafka_server/kafka.p12 -srcstoretype pkcs12 -deststorepass manning123 -destkeystore /export/kafka_server/kafka_server.jks -deststoretype JKS

#Cleans up
rm /export/kafka_server/kafka.p12 
rm /export/kafka_server/kafka_keys.pem 
rm /export/kafka_server/kafka_cert.pem 
rm /export/kafka_server/kafka_key.pem
rm /export/kafka_server/csr-for-kafka

##### ORDER PROCESSING MICROSERVICE #####

#Generates a private key for the Order Processing microservice
openssl genrsa -aes256 -passout pass:"manning123" -out /export/orderprocessing/app_key.pem 4096

#Generates certificate signing request (CSR) for the Order Processing microservice 
openssl req -passin pass:"manning123" -new -key /export/orderprocessing/app_key.pem -out /export/orderprocessing/csr-for-app -subj "/CN=orders.ecomm.com"

#Generates Order Processing microservice’s certificate, which is signed by the CA	
openssl x509 -req -passin pass:"manning123" -days 365 -in /export/orderprocessing/csr-for-app -CA /export/ca/ca_cert.pem -CAkey /export/ca/ca_key.pem -set_serial 01 -out /export/orderprocessing/app_cert.pem

#Creates a Java keystore with Order Processing microservice’s private/public keys
openssl rsa -passin pass:"manning123" -in /export/orderprocessing/app_key.pem -out /export/orderprocessing/app_key.pem

cat /export/orderprocessing/app_key.pem /export/orderprocessing/app_cert.pem >> /export/orderprocessing/application_keys.pem

openssl pkcs12  -export -passout pass:"manning123" -in /export/orderprocessing/application_keys.pem -out /export/orderprocessing/app.p12

keytool -importkeystore -srcstorepass manning123 -srckeystore /export/orderprocessing/app.p12 -srcstoretype pkcs12 -deststorepass manning123 -destkeystore /export/orderprocessing/orderprocessing.jks -deststoretype JKS

#Cleans up
rm /export/orderprocessing/app.p12 
rm /export/orderprocessing/application_keys.pem 
rm /export/orderprocessing/app_cert.pem 
rm /export/orderprocessing/app_key.pem
rm /export/orderprocessing/csr-for-app

##### BUYING HISTORY MICROSERVICE #####

#Generates a private key for the Buying History microservice
openssl genrsa -aes256 -passout pass:"manning123" -out /export/buyinghistory/buyinghistory_key.pem 4096

#Generates certificate signing request (CSR) for the Buying History microservice 
openssl req -passin pass:"manning123" -new -key /export/buyinghistory/buyinghistory_key.pem -out /export/buyinghistory/csr-for-buyinghistory -subj "/CN=bh.ecomm.com"

#Generates Buying History microservice’s certificate, which is signed by the CA	
openssl x509 -req -passin pass:"manning123" -days 365 -in /export/buyinghistory/csr-for-buyinghistory -CA /export/ca/ca_cert.pem -CAkey /export/ca/ca_key.pem -set_serial 01 -out /export/buyinghistory/buyinghistory_cert.pem

#Creates a Java keystore with Buying History microservice’s private/public keys
openssl rsa -passin pass:"manning123" -in /export/buyinghistory/buyinghistory_key.pem -out /export/buyinghistory/buyinghistory_key.pem

cat /export/buyinghistory/buyinghistory_key.pem /export/buyinghistory/buyinghistory_cert.pem >> /export/buyinghistory/buyinghistory_keys.pem

openssl pkcs12  -export -passout pass:"manning123" -in /export/buyinghistory/buyinghistory_keys.pem -out /export/buyinghistory/buyinghistory.p12

keytool -importkeystore -srcstorepass manning123 -srckeystore /export/buyinghistory/buyinghistory.p12 -srcstoretype pkcs12 -deststorepass manning123 -destkeystore /export/buyinghistory/buyinghistory.jks -deststoretype JKS

#Cleans up
rm /export/buyinghistory/buyinghistory.p12 
rm /export/buyinghistory/buyinghistory_keys.pem 
rm /export/buyinghistory/buyinghistory_cert.pem 
rm /export/buyinghistory/buyinghistory_key.pem
rm /export/buyinghistory/csr-for-buyinghistory

cp /export/ca/truststore.jks /export/kafka_server/
cp /export/ca/truststore.jks /export/orderprocessing/
cp /export/ca/truststore.jks /export/buyinghistory/
rm /export/ca/truststore.jks




