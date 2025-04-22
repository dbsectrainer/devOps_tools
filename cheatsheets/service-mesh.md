# Service Mesh & Istio Cheatsheet

*This cheatsheet provides a reference for service mesh concepts, Istio commands, and configuration examples.*

*Note: Istio 1.20.0 is the latest version as of April 2025*

## Istio Installation
```bash
# Download Istio
curl -L https://istio.io/downloadIstio | sh -     # Download latest Istio release
cd istio-1.20.0                                   # Enter Istio directory
export PATH=$PWD/bin:$PATH                        # Add istioctl to PATH

# Install Istio Core
istioctl install --set profile=demo -y            # Install Istio with demo profile
                                                 # Includes core components and addons

# Enable Automatic Sidecar Injection
kubectl label namespace default istio-injection=enabled  # Auto-inject Envoy proxy
                                                       # into all pods in namespace

# Verify Installation
istioctl verify-install                           # Check installation status
kubectl get pods -n istio-system                  # View Istio components
```

## Istio Components
```bash
# Control Plane Components
kubectl get pods -n istio-system                  # List all Istio control plane pods
kubectl get svc -n istio-system                   # Show Istio-related services

# Istiod (Pilot, Citadel, Galley combined)
kubectl describe deployment istiod -n istio-system  # View Istio control plane details
                                                  # Manages configuration, certs, discovery

# Ingress/Egress Gateways
kubectl get pods -l app=istio-ingressgateway -n istio-system  # Check ingress gateway status
kubectl get pods -l app=istio-egressgateway -n istio-system   # Check egress gateway status
```

## Traffic Management
```yaml
# Virtual Service
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: reviews
spec:
  hosts:
  - reviews
  http:
  - match:
    - headers:
        end-user:
          exact: jason
    route:
    - destination:
        host: reviews
        subset: v2
  - route:
    - destination:
        host: reviews
        subset: v1

# Destination Rule
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: reviews
spec:
  host: reviews
  trafficPolicy:
    loadBalancer:
      simple: RANDOM
  subsets:
  - name: v1
    labels:
      version: v1
  - name: v2
    labels:
      version: v2
    trafficPolicy:
      loadBalancer:
        simple: ROUND_ROBIN
```

## Traffic Splitting & Canary Deployments
```yaml
# Traffic Splitting
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: reviews
spec:
  hosts:
  - reviews
  http:
  - route:
    - destination:
        host: reviews
        subset: v1
      weight: 80
    - destination:
        host: reviews
        subset: v2
      weight: 20

# A/B Testing
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: reviews
spec:
  hosts:
  - reviews
  http:
  - match:
    - headers:
        user-agent:
          regex: ".*Chrome.*"
    route:
    - destination:
        host: reviews
        subset: v2
  - route:
    - destination:
        host: reviews
        subset: v1
```

## Fault Injection
```yaml
# Delay Injection
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: ratings
spec:
  hosts:
  - ratings
  http:
  - fault:
      delay:
        percentage:
          value: 50
        fixedDelay: 5s
    route:
    - destination:
        host: ratings
        subset: v1

# Abort Injection
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: ratings
spec:
  hosts:
  - ratings
  http:
  - fault:
      abort:
        percentage:
          value: 50
        httpStatus: 500
    route:
    - destination:
        host: ratings
        subset: v1
```

## Security
```yaml
# PeerAuthentication (mTLS)
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: istio-system
spec:
  mtls:
    mode: STRICT

# Namespace-specific mTLS
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: my-namespace
spec:
  mtls:
    mode: PERMISSIVE

# Authorization Policy
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: httpbin
  namespace: default
spec:
  selector:
    matchLabels:
      app: httpbin
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/default/sa/sleep"]
    to:
    - operation:
        methods: ["GET"]
        paths: ["/info*"]
```

## JWT Authentication
```yaml
# Request Authentication
apiVersion: security.istio.io/v1beta1
kind: RequestAuthentication
metadata:
  name: jwt-example
  namespace: default
spec:
  selector:
    matchLabels:
      app: httpbin
  jwtRules:
  - issuer: "testing@secure.istio.io"
    jwksUri: "https://raw.githubusercontent.com/istio/istio/release-1.20/security/tools/jwt/samples/jwks.json"

# Authorization with JWT Claims
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: require-jwt
  namespace: default
spec:
  selector:
    matchLabels:
      app: httpbin
  action: ALLOW
  rules:
  - from:
    - source:
        requestPrincipals: ["testing@secure.istio.io/testing@secure.istio.io"]
    when:
    - key: request.auth.claims[groups]
      values: ["group1"]
```

## Gateway Configuration
```yaml
# Gateway
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: bookinfo-gateway
spec:
  selector:
    istio: ingressgateway
  servers:
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - "bookinfo.example.com"

# TLS Gateway
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: bookinfo-gateway
spec:
  selector:
    istio: ingressgateway
  servers:
  - port:
      number: 443
      name: https
      protocol: HTTPS
    tls:
      mode: SIMPLE
      credentialName: bookinfo-cert
    hosts:
    - "bookinfo.example.com"

# VirtualService with Gateway
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: bookinfo
spec:
  hosts:
  - "bookinfo.example.com"
  gateways:
  - bookinfo-gateway
  http:
  - match:
    - uri:
        prefix: /productpage
    route:
    - destination:
        host: productpage
        port:
          number: 9080
```

## Egress Traffic
```yaml
# Service Entry
apiVersion: networking.istio.io/v1alpha3
kind: ServiceEntry
metadata:
  name: external-svc
spec:
  hosts:
  - api.external-service.com
  ports:
  - number: 443
    name: https
    protocol: HTTPS
  resolution: DNS
  location: MESH_EXTERNAL

# Egress Gateway
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: istio-egressgateway
spec:
  selector:
    istio: egressgateway
  servers:
  - port:
      number: 443
      name: https
      protocol: HTTPS
    hosts:
    - api.external-service.com
    tls:
      mode: PASSTHROUGH

# Route to Egress Gateway
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: direct-external-through-egress-gateway
spec:
  hosts:
  - api.external-service.com
  gateways:
  - mesh
  - istio-egressgateway
  http:
  - match:
    - gateways:
      - mesh
      port: 80
    route:
    - destination:
        host: istio-egressgateway.istio-system.svc.cluster.local
        port:
          number: 80
  - match:
    - gateways:
      - istio-egressgateway
      port: 80
    route:
    - destination:
        host: api.external-service.com
        port:
          number: 80
```

## Observability
```yaml
# Prometheus Configuration
apiVersion: telemetry.istio.io/v1alpha1
kind: Telemetry
metadata:
  name: mesh-default
  namespace: istio-system
spec:
  metrics:
  - providers:
    - name: prometheus
    overrides:
    - match:
        metric: REQUEST_COUNT
        mode: CLIENT_AND_SERVER
      disabled: false

# Jaeger Configuration
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
spec:
  addonComponents:
    tracing:
      enabled: true
  values:
    global:
      tracer:
        zipkin:
          address: jaeger-collector.observability:9411
```

## Istio CLI Commands
```bash
# Istio Status
istioctl proxy-status                             # Show sync status of all Envoy proxies
istioctl analyze                                  # Analyze mesh for potential issues

# Debugging
istioctl proxy-config clusters <pod-name>         # View service clusters config
istioctl proxy-config routes <pod-name>           # Inspect routing configuration
istioctl proxy-config endpoints <pod-name>        # Check endpoint discovery
istioctl proxy-config listeners <pod-name>        # View network listeners

# Validation
istioctl validate -f virtual-service.yaml         # Validate configuration file
istioctl experimental describe service <service-name>  # Show service configuration

# Dashboard Access
istioctl dashboard kiali                          # Open service mesh visualization
istioctl dashboard jaeger                         # Access distributed tracing
istioctl dashboard grafana                        # View metrics and dashboards
istioctl dashboard prometheus                     # Query metrics and alerts
```

## Resource Hooks
```yaml
# PreSync Hook
apiVersion: batch/v1
kind: Job
metadata:
  name: pre-sync-job
  annotations:
    argocd.argoproj.io/hook: PreSync
    argocd.argoproj.io/hook-delete-policy: HookSucceeded
spec:
  template:
    spec:
      containers:
      - name: pre-sync
        image: alpine:3.18
        command: ["sh", "-c", "echo Pre-sync job running"]
      restartPolicy: Never

# PostSync Hook
apiVersion: batch/v1
kind: Job
metadata:
  name: post-sync-job
  annotations:
    argocd.argoproj.io/hook: PostSync
    argocd.argoproj.io/hook-delete-policy: HookSucceeded
spec:
  template:
    spec:
      containers:
      - name: post-sync
        image: alpine:3.18
        command: ["sh", "-c", "echo Post-sync job running"]
      restartPolicy: Never
```

## Best Practices

1. **Traffic Management**
   - Start with simple routing rules and gradually add complexity
   - Use canary deployments for safe rollouts
   - Implement circuit breaking for resilience
   - Test fault injection scenarios regularly

2. **Security**
   ```yaml
   # Enable mTLS globally
   apiVersion: security.istio.io/v1beta1
   kind: PeerAuthentication
   metadata:
     name: default
     namespace: istio-system
   spec:
     mtls:
       mode: STRICT
   
   # Implement least privilege authorization
   apiVersion: security.istio.io/v1beta1
   kind: AuthorizationPolicy
   metadata:
     name: default-deny
     namespace: default
   spec:
     {}  # empty spec means deny all
   ```

3. **Performance Optimization**
   - Use locality load balancing for multi-region deployments
   - Implement connection pooling
   - Configure proper timeouts and retries
   - Monitor and tune resource usage

4. **Observability**
   - Set up comprehensive metrics collection
   - Implement distributed tracing
   - Create custom dashboards for service health
   - Configure proper alerting

5. **Upgrade Strategy**
   - Test upgrades in non-production environments
   - Use canary upgrades for control plane
   - Follow the official upgrade guide
   - Have a rollback plan ready

## Additional Resources

- [Istio Documentation](https://istio.io/latest/docs/)
- [Istio Examples](https://github.com/istio/istio/tree/master/samples)
- [Kiali Documentation](https://kiali.io/docs/)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)
- [Service Mesh Interface (SMI)](https://smi-spec.io/)
- [Linkerd Documentation](https://linkerd.io/2.14/overview/) - Alternative service mesh
- [DevOps Glossary](../cheatsheets/devops_glossary.md)
