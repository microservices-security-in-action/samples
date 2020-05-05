package authz.orders.policy6    
  
default allow = false    

certificate = `-----BEGIN CERTIFICATE-----
MIICxzCCAa+gAwIBAgIEHP9VkjANBgkqhkiG9w0BAQsFADAUMRIwEAYDVQQDEwls
b2NhbGhvc3QwHhcNMTgwNDI3MDAzNTAyWhcNMTgwNzI2MDAzNTAyWjAUMRIwEAYD
VQQDEwlsb2NhbGhvc3QwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQD5
ZwGM+ysW8Y7CpUl3y+lX6A3HmidPIuNjHzria0i9TE7wPibABpimNcmCyt7Z1xeN
DTcE4sl1yNjk1z0pyV5rT2eEUgQkMbehvDGb2BDDk6nVNKEI/fRep/xvsjvfwQcM
VPqoAG6XuK0jFKvP4CpS+P0tJQoTD9x1esl67pvvWod39iISVQgDR+NXCUVy1vDt
ERuLdLLedZ2b3KTszcYgqRrvuPHDUzAgGDaSV8MmCcTvZ8+Q+LcWZolMkDj72wqB
+eIWp0w1+TItVs6L0TcOVqgbESK3p8pMj0ZHVJZfjQWGGAt1PJZ27bP1FLYE6n7d
31YUxN11pvz593gvaZgJAgMBAAGjITAfMB0GA1UdDgQWBBRvOfq/9vqyjGZay5cx
O/FFUdfH+TANBgkqhkiG9w0BAQsFAAOCAQEAVPl27J8nYnbRlL2FtUieu5afVLi2
Xg7XRn80wcbx/1zH4zjgZLyV3PRw99BKDerxdObeDWhWBnHHylrY2bi4XHRhxbGl
6n7Mi7NNGtYxb8fpi7IMKZrnLGxmXE2s+yGcX8ksmw1axQDJJ6VIKrspeUZ+5Bgd
kIj0Q0Ia1I707BI5wHz4UBylPDQ0XHamR4u7Mj30+rSZVIk/sPhiLo9gAis3E5+4
oWgYufC89m2ROc2G877DNdlcKQF5bO1dC9zMB3ZNBDleRjL/op18k5C6uay2rLEb
5Amlg9MMzHR0Yt/WNsewUmhwZi+oArfEl5XONZmtBYTs5jIgkOwsDPcZVg==
-----END CERTIFICATE-----`

allow {    
  input.method = "GET"
  input.empid = emp_id
  input.path = ["orders",emp_id]
  token.payload.authorities[_] = "ROLE_USER"
}

token = {"payload": payload} {
  io.jwt.verify_rs256(input.token, certificate)
  [header, payload, signature] := io.jwt.decode(input.token)
  payload.exp >= now_in_seconds
}

now_in_seconds = time.now_ns() / 1000000000


