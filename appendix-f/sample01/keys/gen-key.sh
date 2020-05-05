
##### CERTIFICATE AUTHORITY #####

openssl req  -nodes -new -x509  -keyout /export/ca/ca.key -out /export/ca/ca.cert -subj "/CN=ca.ecomm.com"

##### OPA SERVER #####

openssl req  -nodes -new -x509  -keyout /export/opa/opa.key -out /export/opa/opa.cert -subj "/CN=opa.ecomm.com"

#Generates certificate signing request (CSR) for OPA server
openssl req -new -key /export/opa/opa.key -out /export/opa/csr-for-app -subj "/CN=opa.ecomm.com"

#Generates OPA server certificate, which is signed by the CA	
openssl x509 -req  -days 365 -in /export/opa/csr-for-app -CA /export/ca/ca.cert -CAkey /export/ca/ca.key -set_serial 01 -out /export/opa/opa.cert

#Cleans up
rm /export/opa/csr-for-app

##### OPA CLIENT #####

openssl req  -nodes -new -x509  -keyout /export/client/client.key -out /export/client/client.cert -subj "/CN=client.ecomm.com"

#Generates certificate signing request (CSR) for OPA client
openssl req -new -key /export/client/client.key -out /export/client/csr-for-client -subj "/CN=client.ecomm.com"

#Generates OPA client certificate, which is signed by the CA	
openssl x509 -req  -days 365 -in /export/client/csr-for-client -CA /export/ca/ca.cert -CAkey /export/ca/ca.key -set_serial 01 -out /export/client/client.cert

#Cleans up
rm /export/client/csr-for-client
