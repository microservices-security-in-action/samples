package authz.orders.policy4    
  
import input    

import data.order_policy_data_from_file as policies    

default allow = false    

allow {    
  policy = policies[_]    
  policy.method = input.method    
  policy.path = input.path    
  policy.scopes[_] = input.scopes[_]    
}

