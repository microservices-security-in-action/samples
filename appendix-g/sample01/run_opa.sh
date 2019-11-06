docker run "$(pwd)"/policies:/policies -p 8181:8181 openpolicyagent/opa:0.15.0 run /policies --server
