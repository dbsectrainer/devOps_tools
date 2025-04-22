# Kubernetes Cheatsheet

*This cheatsheet provides a reference for Kubernetes commands, resource definitions, and best practices.*

*Note: Istio 1.25.2, Flux v2.2.0, and Prometheus 3.0 are the latest versions as of April 2025*

## Basic Commands
```bash
# Cluster Information
kubectl cluster-info                # Display detailed information about the cluster endpoints and health
kubectl version                     # Show both client and server versions of kubectl and Kubernetes
kubectl api-resources              # List all supported API resources (pods, services, etc.) with their shortnames and API groups
kubectl api-versions              # List all API versions supported by the server, useful for API compatibility

# Pod Management
kubectl get pods                    # List all pods in the current namespace with basic info (name, status, age)
kubectl get pods -o wide           # List pods with additional details like IP and node allocation
kubectl describe pod <pod>         # Show detailed information about a pod including events and configuration
kubectl logs <pod>                 # View container logs from pod, useful for debugging
kubectl exec -it <pod> -- /bin/sh  # Start an interactive shell session inside the pod for debugging
kubectl delete pod <pod>           # Delete a pod (note: if managed by deployment, it will be recreated)

# Deployment Management
kubectl get deployments            # List all deployments with their status and replica counts
kubectl create deployment <name> --image=<image>  # Create a new deployment from a container image
kubectl scale deployment <name> --replicas=3      # Scale the deployment up or down to specified number of replicas
kubectl rollout status deployment/<name>          # Monitor the status of a deployment rollout
kubectl rollout history deployment/<name>         # View the revision history of a deployment
kubectl rollout undo deployment/<name>            # Rollback to the previous deployment version if issues are found
```

## Resource Creation
```yaml
# Pod
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
spec:
  containers:
  - name: nginx
    image: nginx:latest
    ports:
    - containerPort: 80

# Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:latest
        ports:
        - containerPort: 80

# Service
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
```

## Namespace Management
```bash
# Namespace Operations
kubectl get namespaces                    # List all namespaces in the cluster for resource isolation
kubectl create namespace <name>           # Create a new namespace for grouping resources
kubectl delete namespace <name>           # Delete a namespace and all its resources
kubectl config set-context --current --namespace=<name>  # Switch to a different namespace in current context

# Resource Quotas
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
spec:
  hard:
    requests.cpu: "1"
    requests.memory: 1Gi
    limits.cpu: "2"
    limits.memory: 2Gi
```

## Configuration
```yaml
# ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  app.properties: |
    key1=value1
    key2=value2

# Secret
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
data:
  username: dXNlcm5hbWU=  # base64 encoded
  password: cGFzc3dvcmQ=  # base64 encoded

# Using ConfigMap/Secret
spec:
  containers:
  - name: app
    env:
    - name: USERNAME
      valueFrom:
        secretKeyRef:
          name: app-secret
          key: username
    volumeMounts:
    - name: config-volume
      mountPath: /etc/config
  volumes:
  - name: config-volume
    configMap:
      name: app-config
```

## Storage
```yaml
# PersistentVolume
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-volume
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: "/mnt/data"

# PersistentVolumeClaim
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pv-claim
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```

## Networking
```yaml
# Service Types
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  type: LoadBalancer  # Or ClusterIP, NodePort
  ports:
  - port: 80
    targetPort: 8080
  selector:
    app: my-app

# Ingress
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
spec:
  rules:
  - host: myapp.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: my-service
            port:
              number: 80

# Network Policy
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-allow
spec:
  podSelector:
    matchLabels:
      app: api
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: web
```

## Security
```yaml
# RBAC - Role
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]

# RBAC - RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
subjects:
- kind: User
  name: jane
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io

# Pod Security Standards
apiVersion: v1
kind: Namespace
metadata:
  name: psp-example
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/warn: baseline
```

## Advanced Features
```yaml
# HorizontalPodAutoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: php-apache
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: php-apache
  minReplicas: 1
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50

# PodDisruptionBudget
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: app-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: my-app

# StatefulSet
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: web
spec:
  serviceName: "nginx"
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:latest
        ports:
        - containerPort: 80
```

## Monitoring & Debugging
```bash
# Resource Monitoring
kubectl top nodes                  # Display CPU and memory usage metrics for all nodes
kubectl top pods                   # Show resource consumption for pods (requires metrics-server)

# Debugging
kubectl describe pod <pod>         # Show detailed pod information including events and status
kubectl logs <pod> -c <container>  # View logs from a specific container in a pod
kubectl exec -it <pod> -- /bin/sh  # Get an interactive shell in the pod for live debugging
kubectl port-forward <pod> 8080:80 # Forward local port 8080 to port 80 in the pod for testing

# Events & Auditing
kubectl get events                 # View all events in the cluster for troubleshooting
kubectl get events --sort-by=.metadata.creationTimestamp  # View events sorted by time for chronological analysis
```

## Best Practices
1. **Resource Management**
   ```yaml
   resources:
     requests:
       memory: "64Mi"
       cpu: "250m"
     limits:
       memory: "128Mi"
       cpu: "500m"
   ```

2. **Health Checks**
   ```yaml
   livenessProbe:
     httpGet:
       path: /healthz
       port: 8080
     initialDelaySeconds: 3
     periodSeconds: 3
   readinessProbe:
     httpGet:
       path: /ready
       port: 8080
     initialDelaySeconds: 5
     periodSeconds: 5
   ```

3. **Pod Disruption Budget**
   ```yaml
   apiVersion: policy/v1
   kind: PodDisruptionBudget
   metadata:
     name: app-pdb
   spec:
     minAvailable: 2
     selector:
       matchLabels:
         app: my-app
   ```

4. **Update Strategies**
   ```yaml
   spec:
     strategy:
       type: RollingUpdate
       rollingUpdate:
         maxUnavailable: 25%
         maxSurge: 25%
   ```

5. **Security Context**
   ```yaml
   securityContext:
     runAsNonRoot: true
     runAsUser: 1000
     readOnlyRootFilesystem: true
     allowPrivilegeEscalation: false
   ```

## Pod Security Standards
```yaml
apiVersion: v1
kind: Namespace
metadata:
 name: restricted-namespace
 labels:
   pod-security.kubernetes.io/enforce: restricted
   pod-security.kubernetes.io/audit: restricted
   pod-security.kubernetes.io/warn: restricted

# Pod Security Context with Standards
apiVersion: v1
kind: Pod
metadata:
 name: security-standards-pod
spec:
 securityContext:
   runAsNonRoot: true
   seccompProfile:
     type: RuntimeDefault
 containers:
 - name: restricted-container
   image: nginx:1.25.0
   securityContext:
     allowPrivilegeEscalation: false
     capabilities:
       drop:
       - ALL
     runAsUser: 1000
     readOnlyRootFilesystem: true
```

## Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/home/)
- [Kubernetes Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
- [Kubernetes Patterns](https://k8spatterns.io/)
- [CNCF Landscape](https://landscape.cncf.io/) - Cloud Native ecosystem
- [DevOps Glossary](../cheatsheets/devops_glossary.md)
