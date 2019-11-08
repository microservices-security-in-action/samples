package authz.orders.policy7    
  
import input    

import data.order_policy_data_from_bundle as policies    

default allow = false    

allow {    
  policy = policies[_]    
  policy.method = input.method    
  policy.path = input.path    
  policy.scopes[_] = input.scopes[_]    
}

