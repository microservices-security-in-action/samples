package authz.orders.policy2    
  
default allow = false    

allow {    
  allowed_methods_for_manager[input.method]
  input.path = "orders"
  input.role = "manager"
}

allow {    
  allowed_methods_for_dept_manager[input.method]
  input.deptid = dept_id
  input.path = ["orders",dept_id]
  input.role = "dept_manager"
}

allow {    
  input.method = "GET"
  input.empid = emp_id
  input.path = ["orders",emp_id]
}

allowed_methods_for_manager = {"POST","PUT","DELETE"}
allowed_methods_for_dept_manager = {"POST","PUT","DELETE"}