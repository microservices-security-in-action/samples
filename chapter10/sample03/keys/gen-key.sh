
##### CERTIFICATE AUTHORITY #####

#Generates a private key for the certificate authority
openssl genrsa -aes256 -passout pass:"manning123" -out /export/ca/ca_key.pem 4096

#Generates a public key for the certificate authority
openssl  req -new -passin pass:"manning123" -key /export/ca/ca_key.pem -x509 -days 365 -out /export/ca/ca_cert.pem -subj "/CN=ca.ecomm.com"

##### Nginx Server #####

#Generates a private key for the Nginx Server
openssl genrsa -aes256 -passout pass:"manning123" -out /export/nginx/nginx_key.pem 4096

#Generates certificate signing request (CSR) for the Nginx Server 
openssl req -passin pass:"manning123" -new -key /export/nginx/nginx_key.pem -out /export/nginx/csr-for-nginx -subj "/CN=nginx.ecomm.com"

#Generates Nginx Server’s certificate, which is signed by the CA	
openssl x509 -req -passin pass:"manning123" -days 365 -in /export/nginx/csr-for-nginx -CA /export/ca/ca_cert.pem -CAkey /export/ca/ca_key.pem -set_serial 01 -out /export/nginx/nginx_cert.pem

openssl rsa -passin pass:"manning123" -in /export/nginx/nginx_key.pem -out /export/nginx/nginx_key.pem

##### Docker Client #####

#Generates a private key for the Docker Client
openssl genrsa -aes256 -passout pass:"manning123" -out /export/docker/docker_key.pem 4096

#Generates certificate signing request (CSR) for the Docker Client 
openssl req -passin pass:"manning123" -new -key /export/docker/docker_key.pem -out /export/docker/csr-for-docker -subj "/CN=nginx.ecomm.com"

#Generates Docker Client’s certificate, which is signed by the CA	
openssl x509 -req -passin pass:"manning123" -days 365 -in /export/docker/csr-for-docker -CA /export/ca/ca_cert.pem -CAkey /export/ca/ca_key.pem -set_serial 01 -out /export/docker/docker_cert.pem

openssl rsa -passin pass:"manning123" -in /export/docker/docker_key.pem -out /export/docker/docker_key.pem