package authz.orders.policy5    
  
import input.external as policy    

default allow = false    

allow {    
  policy.method = input.method    
  policy.path = input.path    
  policy.scopes[_] = input.scopes[_]    
}

