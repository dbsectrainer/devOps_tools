# Compliance as Code & Chaos Engineering Cheatsheet

*This cheatsheet provides a reference for Compliance as Code tools, Chaos Engineering concepts, and best practices.*

*Note: Tool versions listed are current as of April 2025*

## Open Policy Agent (OPA)
```bash
# Installation
curl -L -o opa https://openpolicy.io/downloads/v0.57.0/opa_linux_amd64_static
chmod 755 opa

# Basic Commands
opa eval -i input.json -d policy.rego "data.example.allow"  # Evaluate policy against input
opa test -v policy_test.rego                               # Run policy unit tests
opa build -b policy.rego                                   # Bundle policy files

# Run OPA Server
opa run --server --addr :8181                             # Start OPA policy server
                                                         # Listen on port 8181

# API Requests
curl localhost:8181/v1/data/example/allow -d @input.json \  # Query policy via HTTP API
     -H 'Content-Type: application/json'                   # Send input as JSON
```

## Rego Policy Language
```rego
# Simple Policy
package example

default allow = false

allow {
    input.user == "admin"
    input.action == "read"
}

# Kubernetes Policy
package kubernetes.admission

deny[msg] {
    input.request.kind.kind == "Pod"
    not input.request.object.spec.securityContext.runAsNonRoot
    msg := "Pods must run as non-root user"
}

# Complex Rule
violation[{"msg": msg}] {
    resource := input.review.object
    not resource.metadata.labels.owner
    msg := sprintf("Resource %v must have an owner label", [resource.metadata.name])
}

# Function Definition
is_admin(user) {
    user.roles[_] == "admin"
}

# Rule with Function
allow {
    is_admin(input.user)
}
```

## OPA Gatekeeper
```yaml
# Installation
kubectl apply -f https://raw.githubusercontent.com/open-policy-agent/gatekeeper/v3.14.0/deploy/gatekeeper.yaml

# ConstraintTemplate
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: requiredlabels
spec:
  crd:
    spec:
      names:
        kind: RequiredLabels
      validation:
        openAPIV3Schema:
          properties:
            labels:
              type: array
              items:
                type: string
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package requiredlabels
        violation[{"msg": msg}] {
          provided := {label | input.review.object.metadata.labels[label]}
          required := {label | label := input.parameters.labels[_]}
          missing := required - provided
          count(missing) > 0
          msg := sprintf("Missing required labels: %v", [missing])
        }

# Constraint
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: RequiredLabels
metadata:
  name: require-owner-label
spec:
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Pod"]
  parameters:
    labels: ["owner", "app"]
```

## Conftest
```bash
# Installation
brew install conftest  # macOS
wget https://github.com/open-policy-agent/conftest/releases/download/v0.45.0/conftest_0.45.0_Linux_x86_64.tar.gz
tar xzf conftest_0.45.0_Linux_x86_64.tar.gz

# Testing Configuration Files
conftest test deployment.yaml                              # Test single config file
conftest test --policy policy/ deployment.yaml             # Test against policies in directory
conftest test --combine deployment.yaml service.yaml       # Test multiple related configs

# Testing Multiple File Types
conftest test --parser yaml deployment.yaml \              # Test different file formats
              --parser json app.json                       # Specify parser for each

# Output Formats
conftest test --output json deployment.yaml                # Generate JSON results
conftest test --output table deployment.yaml               # Display tabular format
```

## InSpec
```ruby
# Profile Structure
# inspec.yml
name: my-profile
title: My Compliance Profile
version: 1.0.0
supports:
  - os-family: linux

# controls/example.rb
control 'file-1.0' do
  impact 1.0
  title 'Verify /etc/passwd file'
  desc 'Ensure /etc/passwd has appropriate permissions'
  
  describe file('/etc/passwd') do
    it { should exist }
    it { should be_file }
    its('mode') { should cmp '0644' }
    its('owner') { should eq 'root' }
    its('group') { should eq 'root' }
  end
end

# Running InSpec
inspec exec my-profile
inspec exec my-profile -t ssh://user@hostname
inspec exec https://github.com/dev-sec/linux-baseline
```

## Chaos Engineering Principles
1. **Build a Hypothesis**: Form a hypothesis about how the system should behave under stress
2. **Define Steady State**: Establish metrics that indicate normal system behavior
3. **Introduce Chaos**: Simulate real-world failures
4. **Observe Results**: Monitor system behavior during experiments
5. **Improve Resilience**: Fix issues and strengthen the system

## Chaos Toolkit
```bash
# Installation
pip install chaostoolkit                                   # Install Chaos Toolkit

# Create Experiment
chaos init experiment.json                                 # Initialize new experiment
                                                         # Creates template file

# Run Experiment
chaos run experiment.json                                  # Execute chaos experiment
                                                         # Follows defined steps

# Generate Report
chaos report --export-format=pdf experiment.json           # Create PDF report
                                                         # Documents results

# Experiment Definition
{
  "version": "1.0.0",
  "title": "System responds to service termination",
  "description": "Verifies system resilience when a service is terminated",
  "tags": ["kubernetes", "microservices"],
  "steady-state-hypothesis": {
    "title": "Services are available",
    "probes": [
      {
        "type": "probe",
        "name": "api-responds",
        "tolerance": 200,
        "provider": {
          "type": "http",
          "url": "http://api.example.com/health"
        }
      }
    ]
  },
  "method": [
    {
      "type": "action",
      "name": "terminate-service",
      "provider": {
        "type": "process",
        "path": "kubectl",
        "arguments": ["delete", "pod", "-l", "app=api", "--grace-period=0"]
      },
      "pauses": {
        "after": 5
      }
    }
  ],
  "rollbacks": [
    {
      "type": "action",
      "name": "restart-service",
      "provider": {
        "type": "process",
        "path": "kubectl",
        "arguments": ["apply", "-f", "api-deployment.yaml"]
      }
    }
  ]
}
```

## Chaos Mesh
```bash
# Installation
curl -sSL https://mirrors.chaos-mesh.org/v2.6.0/install.sh | bash

# Pod Failure Experiment
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: pod-failure-example
spec:
  action: pod-failure
  mode: one
  selector:
    namespaces:
      - default
    labelSelectors:
      app: web
  duration: "30s"
  scheduler:
    cron: "@every 2m"

# Network Chaos
apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata:
  name: network-delay-example
spec:
  action: delay
  mode: all
  selector:
    namespaces:
      - default
    labelSelectors:
      app: web
  delay:
    latency: "100ms"
    correlation: "25"
    jitter: "10ms"
  duration: "30s"

# IO Chaos
apiVersion: chaos-mesh.org/v1alpha1
kind: IOChaos
metadata:
  name: io-delay-example
spec:
  action: latency
  mode: one
  selector:
    namespaces:
      - default
    labelSelectors:
      app: web
  volumePath: /data
  path: "/data/**"
  delay: "100ms"
  percent: 50
  duration: "30s"
```

## Litmus Chaos
```bash
# Installation
kubectl apply -f https://litmuschaos.github.io/litmus/2.15.0/litmus-2.15.0.yaml

# Pod Delete Experiment
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: nginx-chaos
  namespace: default
spec:
  appinfo:
    appns: 'default'
    applabel: 'app=nginx'
    appkind: 'deployment'
  chaosServiceAccount: litmus-admin
  experiments:
    - name: pod-delete
      spec:
        components:
          env:
            - name: TOTAL_CHAOS_DURATION
              value: '30'
            - name: CHAOS_INTERVAL
              value: '10'
            - name: FORCE
              value: 'false'
```

## Resilience Testing
```bash
# Circuit Breaker Pattern (Java/Spring)
@CircuitBreaker(name = "backendService", fallbackMethod = "fallback")
public String callBackendService() {
    return restTemplate.getForObject("/backend", String.class);
}

public String fallback(Exception e) {
    return "Fallback response";
}

# Retry Pattern (Python)
@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def call_service():
    response = requests.get("http://service/api")
    response.raise_for_status()
    return response.json()

# Bulkhead Pattern (JavaScript)
const bulkhead = new Bulkhead({
  maxConcurrent: 10,
  maxQueue: 20
});

bulkhead.execute(async () => {
  return await callService();
});
```

## Compliance Monitoring
```yaml
# Prometheus Alert
groups:
- name: compliance
  rules:
  - alert: PolicyViolation
    expr: sum(policy_violations) > 0
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Policy violations detected"
      description: "{{ $value }} policy violations have been detected"

# Grafana Dashboard JSON
{
  "title": "Compliance Dashboard",
  "panels": [
    {
      "title": "Policy Violations",
      "type": "graph",
      "datasource": "Prometheus",
      "targets": [
        {
          "expr": "sum(policy_violations) by (policy)",
          "legendFormat": "{{policy}}"
        }
      ]
    }
  ]
}
```

## Best Practices

1. **Compliance as Code**
   - Store policies in version control
   - Implement CI/CD for policy testing
   - Use policy frameworks that support multiple platforms
   - Implement automated compliance reporting
   - Integrate policy checks into development workflow

2. **Policy Development**
   ```rego
   # Start with simple, focused policies
   package kubernetes.pod_security
   
   # Document the purpose
   # Ensures all pods run as non-root user
   violation[{"msg": msg}] {
     # Clear logic with meaningful variable names
     pod := input.review.object
     not pod_runs_as_non_root(pod)
     
     # Helpful error messages
     msg := sprintf("Pod %v must set runAsNonRoot: true", [pod.metadata.name])
   }
   
   # Extract reusable functions
   pod_runs_as_non_root(pod) {
     pod.spec.securityContext.runAsNonRoot == true
   }
   ```

3. **Chaos Engineering**
   - Start small with controlled experiments
   - Always define abort conditions
   - Run experiments in staging before production
   - Automate experiment execution
   - Document and share learnings

4. **Chaos Experiment Design**
   ```json
   {
     "version": "1.0.0",
     "title": "Database connection failure test",
     "description": "Verify application resilience when database connections fail",
     "tags": ["database", "resilience"],
     "steady-state-hypothesis": {
       "title": "Application remains responsive",
       "probes": [
         {
           "type": "probe",
           "name": "api-health-check",
           "tolerance": true,
           "provider": {
             "type": "python",
             "module": "chaosprobe.http",
             "func": "status_is_200",
             "arguments": {
               "url": "http://app.example.com/health"
             }
           }
         }
       ]
     },
     "method": [
       {
         "type": "action",
         "name": "block-db-connection",
         "provider": {
           "type": "python",
           "module": "chaosnetwork.actions",
           "func": "block_network_traffic",
           "arguments": {
             "target_host": "db.example.com",
             "target_port": 5432,
             "duration": 60
           }
         }
       }
     ],
     "rollbacks": [
       {
         "type": "action",
         "name": "restore-db-connection",
         "provider": {
           "type": "python",
           "module": "chaosnetwork.actions",
           "func": "restore_network_traffic",
           "arguments": {
             "target_host": "db.example.com",
             "target_port": 5432
           }
         }
       }
     ]
   }
   ```

5. **GameDay Exercises**
   - Plan scenarios based on real-world failures
   - Involve cross-functional teams
   - Define clear roles and responsibilities
   - Document findings and action items
   - Schedule regular exercises

## Additional Resources

- [Open Policy Agent Documentation](https://www.openpolicyagent.org/docs/latest/)
- [OPA Gatekeeper](https://open-policy-agent.github.io/gatekeeper/website/docs/)
- [Conftest](https://www.conftest.dev/) - Policy testing for configuration files
- [Chaos Toolkit Documentation](https://chaostoolkit.org/reference/usage/cli/)
- [Chaos Mesh Documentation](https://chaos-mesh.org/docs/)
- [Principles of Chaos Engineering](https://principlesofchaos.org/)
- [DevOps Glossary](../cheatsheets/devops_glossary.md)
