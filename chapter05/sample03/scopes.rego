package httpapi.authz

import input

import data.resources

default allow = false

allow {
  resource = resources[_]

  resource.method = input.method
  resource.path = input.path
  resource.scopes[_] = input.scopes[_]
}


