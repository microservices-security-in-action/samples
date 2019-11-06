package authz.orders.policy3    
  
default allow = false    

allow {    
  input.method = "GET"
  input.empid = emp_id
  input.path = ["orders",emp_id]
  token.payload.subordinates[_] = "ROLE_USER2"
}

token = {"payload": payload} {
  [header, payload, signature] := io.jwt.decode(input.token)
}