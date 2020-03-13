
##### CERTIFICATE AUTHORITY #####

#Generates a private key for the certificate authority
openssl genrsa -aes256 -passout pass:"manning123" -out /export/ca/ca_key.pem 4096

#Generates a public key for the certificate authority
openssl  req -new -passin pass:"manning123" -key /export/ca/ca_key.pem -x509 -days 3650 -out /export/ca/ca_cert.pem -subj "/CN=ca.ecomm.com"

##### Order Processing microservice #####

#Generates a private key for the Order Processing microservice
openssl genrsa -aes256 -passout pass:"manning123" -out /export/orderprocessing/app_key.pem 4096

#Generates certificate signing request (CSR) for the Order Processing microservice 
openssl req -passin pass:"manning123" -new -key /export/orderprocessing/app_key.pem -out /export/orderprocessing/csr-for-app -subj "/CN=orders.ecomm.com"

#Generates Order Processing microservice’s certificate, which is signed by the CA	
openssl x509 -req -passin pass:"manning123" -days 3650 -in /export/orderprocessing/csr-for-app -CA /export/ca/ca_cert.pem -CAkey /export/ca/ca_key.pem -set_serial 01 -out /export/orderprocessing/app_cert.pem

#Creates a Java keystore with Order Processing microservice’s private/public keys
openssl rsa -passin pass:"manning123" -in /export/orderprocessing/app_key.pem -out /export/orderprocessing/app_key.pem

cat /export/orderprocessing/app_key.pem /export/orderprocessing/app_cert.pem >> /export/orderprocessing/application_keys.pem

openssl pkcs12  -export -passout pass:"manning123" -in /export/orderprocessing/application_keys.pem -out /export/orderprocessing/app.p12

keytool -importkeystore -srcstorepass manning123 -srckeystore /export/orderprocessing/app.p12 -srcstoretype pkcs12 -deststorepass manning123 -destkeystore /export/orderprocessing/orderprocessing.jks -deststoretype JKS

keytool -changealias -alias "1" -destalias "orderprocessing" -keystore /export/orderprocessing/orderprocessing.jks -storepass manning123

keytool -import -file /export/ca/ca_cert.pem -alias ca -noprompt  -keystore /export/orderprocessing/orderprocessing.jks -storepass manning123

#Cleans up
rm /export/orderprocessing/app.p12 
rm /export/orderprocessing/application_keys.pem 
rm /export/orderprocessing/app_cert.pem 
rm /export/orderprocessing/app_key.pem
rm /export/orderprocessing/csr-for-app

##### Inventory microservice #####

#Generates a private key for the Order Processing microservice
openssl genrsa -aes256 -passout pass:"manning123" -out /export/inventory/app_key.pem 4096

#Generates certificate signing request (CSR) for the Inventory microservice 
openssl req -passin pass:"manning123" -new -key /export/inventory/app_key.pem -out /export/inventory/csr-for-app -subj "/CN=inventory.ecomm.com"

#Generates Inventory microservice’s certificate, which is signed by the CA	
openssl x509 -req -passin pass:"manning123" -days 3650 -in /export/inventory/csr-for-app -CA /export/ca/ca_cert.pem -CAkey /export/ca/ca_key.pem -set_serial 01 -out /export/inventory/app_cert.pem

#Creates a Java keystore with Inventory microservice’s private/public keys
openssl rsa -passin pass:"manning123" -in /export/inventory/app_key.pem -out /export/inventory/app_key.pem

cat /export/inventory/app_key.pem /export/inventory/app_cert.pem >> /export/inventory/application_keys.pem

openssl pkcs12  -export -passout pass:"manning123" -in /export/inventory/application_keys.pem -out /export/inventory/app.p12

keytool -importkeystore -srcstorepass manning123 -srckeystore /export/inventory/app.p12 -srcstoretype pkcs12 -deststorepass manning123 -destkeystore /export/inventory/inventory.jks -deststoretype JKS

keytool -changealias -alias "1" -destalias "inventory" -keystore /export/inventory/inventory.jks -storepass manning123

keytool -import -file /export/ca/ca_cert.pem -alias ca  -noprompt -keystore /export/inventory/inventory.jks -storepass manning123


#Cleans up
rm /export/inventory/app.p12 
rm /export/inventory/application_keys.pem 
rm /export/inventory/app_cert.pem 
rm /export/inventory/app_key.pem
rm /export/inventory/csr-for-app



