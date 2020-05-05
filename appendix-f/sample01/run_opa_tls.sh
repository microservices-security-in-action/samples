docker run -v "$(pwd)"/policies:/policies -v "$(pwd)"/keys:/keys -p 8181:8181 openpolicyagent/opa:0.15.0 run /policies --tls-cert-file /keys/opa/opa.cert --tls-private-key-file /keys/opa/opa.key --server




