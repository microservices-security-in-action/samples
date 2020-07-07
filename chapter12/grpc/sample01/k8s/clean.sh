kubectl delete secret ecomm-credential -n istio-system
kubectl delete svc inventory-service orders-service sts-service
kubectl delete virtualservices ecomm-virtual-service orders-virtual-service sts-virtual-service
kubectl delete deployment inventory-deployment orders-deployment sts-deployment
kubectl delete gateway ecomm-gateway -n istio-system 
kubectl delete authorizationpolicy inventory-services-policy
kubectl delete requestauthentication inventory-req-authn-policy
kubectl delete destinationrule disable-mtls -n istio-system
kubectl delete configmaps orders-application-properties-config-map sts-application-properties-config-map sts-jwt-keystore-config-map
kubectl delete secret sts-keystore-secrets
