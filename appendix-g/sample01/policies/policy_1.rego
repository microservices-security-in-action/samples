package authz.orders.policy1    
  
default allow = false    

allow {    
  input.method = "POST"                    
  input.path = "orders"
  input.role = "manager"
}

allow {    
  input.method = "POST"                    
  input.path = ["orders",dept_id]
  input.deptid = dept_id
  input.role = "dept_manager"
}
