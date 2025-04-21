# Kubernetes Cheatsheet

## Basic Commands
```bash
# Cluster Information
kubectl cluster-info                # Display cluster info
kubectl version                     # Show version
kubectl api-resources              # List all resources
kubectl api-versions              # List api versions

# Pod Management
kubectl get pods                    # List pods
kubectl get pods -o wide           # List pods with more details
kubectl describe pod <pod>         # Show pod details
kubectl logs <pod>                 # View pod logs
kubectl exec -it <pod> -- /bin/sh  # Shell into pod
kubectl delete pod <pod>           # Delete pod

# Deployment Management
kubectl get deployments            # List deployments
kubectl create deployment <name> --image=<image>  # Create deployment
kubectl scale deployment <name> --replicas=3      # Scale deployment
kubectl rollout status deployment/<name>          # Check rollout status
kubectl rollout history deployment/<name>         # View rollout history
kubectl rollout undo deployment/<name>            # Rollback deployment
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
    image: nginx:1.14.2
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
        image: nginx:1.14.2
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
kubectl get namespaces                    # List namespaces
kubectl create namespace <name>           # Create namespace
kubectl delete namespace <name>           # Delete namespace
kubectl config set-context --current --namespace=<name>  # Switch namespace

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

# Pod Security Context
apiVersion: v1
kind: Pod
metadata:
  name: security-context-demo
spec:
  securityContext:
    runAsUser: 1000
    runAsGroup: 3000
    fsGroup: 2000
  containers:
  - name: sec-ctx-demo
    image: busybox
    command: [ "sh", "-c", "sleep 1h" ]
    securityContext:
      allowPrivilegeEscalation: false
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
        image: nginx:1.14.2
        ports:
        - containerPort: 80
```

## Monitoring & Debugging
```bash
# Resource Monitoring
kubectl top nodes                  # Show node resource usage
kubectl top pods                   # Show pod resource usage

# Debugging
kubectl describe pod <pod>         # Detailed pod info
kubectl logs <pod> -c <container>  # Container logs
kubectl exec -it <pod> -- /bin/sh  # Interactive shell
kubectl port-forward <pod> 8080:80 # Port forwarding

# Events & Auditing
kubectl get events                 # View cluster events
kubectl get events --sort-by=.metadata.creationTimestamp  # Sorted events
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
