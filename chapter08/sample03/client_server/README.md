## Build Steps

1. Run the following command in this directory:
```
$ ./gradlew installDist
```

This creates the scripts `inventory-server` and `inventory-client`
in the `build/install/client_server/bin/` directory. The `inventory-server`
needs to be running before starting the client.

#### Generating self-signed certificates for use with grpc

2. You can use the following script to generate self-signed certificates for the inventory server and client:

```bash
mkdir -p /tmp/sslcert
pushd /tmp/sslcert
# Changes these CN's to match your hosts in your environment if needed.
SERVER_CN=localhost
CLIENT_CN=localhost # Used when doing mutual TLS

echo Generate CA key:
openssl genrsa -passout pass:1111 -des3 -out ca.key 4096
echo Generate CA certificate:
# Generates ca.crt which is the trustCertCollectionFile
openssl req -passin pass:1111 -new -x509 -days 365 -key ca.key -out ca.crt -subj "/CN=${SERVER_CN}"
echo Generate server key:
openssl genrsa -passout pass:1111 -des3 -out server.key 4096
echo Generate server signing request:
openssl req -passin pass:1111 -new -key server.key -out server.csr -subj "/CN=${SERVER_CN}"
echo Self-signed server certificate:
# Generates server.crt which is the certChainFile for the server
openssl x509 -req -passin pass:1111 -days 365 -in server.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out server.crt 
echo Remove passphrase from server key:
openssl rsa -passin pass:1111 -in server.key -out server.key
echo Generate client key
openssl genrsa -passout pass:1111 -des3 -out client.key 4096
echo Generate client signing request:
openssl req -passin pass:1111 -new -key client.key -out client.csr -subj "/CN=${CLIENT_CN}"
echo Self-signed client certificate:
# Generates client.crt which is the clientCertChainFile for the client (need for mutual TLS only)
openssl x509 -passin pass:1111 -req -days 365 -in client.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out client.crt
echo Remove passphrase from client key:
openssl rsa -passin pass:1111 -in client.key -out client.key
echo Converting the private keys to X.509:
# Generates client.pem which is the clientPrivateKeyFile for the Client (needed for mutual TLS only)
openssl pkcs8 -topk8 -nocrypt -in client.key -out client.pem
# Generates server.pem which is the privateKeyFile for the Server
openssl pkcs8 -topk8 -nocrypt -in server.key -out server.pem
popd
```

3. Execute the command below to run the inventory server.

```
./build/install/client_server/bin/inventory-server localhost 50440 /tmp/sslcert/server.crt /tmp/sslcert/server.pem
```

If you are using a Windows machine, execute the .bat process of the same.

```
$ ./build/install/client_server/bin/inventory-server.bat localhost 50440 /tmp/sslcert/server.crt /tmp/sslcert/server.pem
```

4. Open a new terminal tab, navigate to the same directory as above and set the value of the JWT token as a system 
variable using the command below

```
$ export TOKEN=<value_of_token>
```

5. Execute this command on the same terminal window to run the inventory client.

```
$ ./build/install/client_server/bin/inventory-client localhost 50440 /tmp/sslcert/ca.crt $TOKEN
```

If you are using a Windows machine, execute the .bat process of the same.

```
$ ./build/install/client_server/bin/inventory-client.bat localhost 50440 /tmp/sslcert/ca.crt $TOKEN
```

You should see the output of the inventory client on the terminal.