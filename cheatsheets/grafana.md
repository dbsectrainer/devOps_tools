# Grafana Cheatsheet

*This cheatsheet provides a reference for Grafana configuration, queries, and best practices.*

*Note: Grafana 11 is the latest version as of April 2025*

## Basic Configuration
```ini
# grafana.ini
[server]
http_port = 3000
domain = localhost

[security]
admin_user = admin
admin_password = admin

[auth]
disable_login_form = false

[smtp]
enabled = true
host = smtp.gmail.com:587
user = your-email@gmail.com
password = your-password
```

## Dashboard JSON Structure
```json
{
  "dashboard": {
    "id": null,
    "title": "My Dashboard",
    "tags": ["production", "metrics"],
    "timezone": "browser",
    "panels": [
      {
        "type": "graph",
        "title": "HTTP Requests",
        "gridPos": {
          "h": 8,
          "w": 12,
          "x": 0,
          "y": 0
        }
      }
    ],
    "time": {
      "from": "now-6h",
      "to": "now"
    },
    "refresh": "5s"
  }
}
```

## PromQL Query Examples
```sql
# Basic Metrics
rate(http_requests_total[5m])              # Calculate request rate over 5-minute window
sum by (status_code) (http_requests_total) # Group total requests by HTTP status code
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) # Calculate 95th percentile of request latency

# Container Metrics
sum(rate(container_cpu_usage_seconds_total{container!=""}[5m])) by (pod)  # Average CPU usage per pod
sum(container_memory_usage_bytes) by (pod) # Total memory consumption per pod

# Application Metrics
rate(application_requests_total{handler="/api/v1/users"}[5m])  # Request rate for specific API endpoint
sum(rate(application_errors_total[5m])) by (type)              # Error frequency grouped by error type
```

## Alert Rules
```yaml
# Alert Definition
groups:
- name: example
  rules:
  - alert: HighRequestLatency
    expr: job:request_latency_seconds:mean5m{job="myjob"} > 0.5
    for: 10m
    labels:
      severity: page
    annotations:
      summary: High request latency on {{ $labels.instance }}
      description: Request latency is above 500ms (current value is {{ $value }})

# Notification Channel
apiVersion: 1
notifiers:
  - name: Slack
    type: slack
    uid: slack1
    settings:
      url: https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
      recipient: "#alerts"
```

## Dashboard Variables
```
# Time Variables
$__interval          # Grafana interval variable
$__range             # Time range of dashboard
$__from              # From timestamp
$__to                # To timestamp

# Custom Variables
${datacenter:csv}    # Comma-separated values
${environment:json}  # JSON format
${host:pipe}        # Pipe-separated values
${status:regex}     # Regex values

# Query Variables
label_values(node_cpu_seconds_total, instance)
query_result(sum(rate(http_requests_total[5m])))
```

## Panel Configuration
```yaml
# Time Series Panel
panels:
  - type: graph
    title: CPU Usage
    datasource: Prometheus
    targets:
      - expr: sum(rate(container_cpu_usage_seconds_total[5m])) by (pod)
    options:
      legend:
        show: true
      tooltip:
        shared: true
      yaxes:
        - format: percent
          min: 0

# Stat Panel
panels:
  - type: stat
    title: Total Requests
    targets:
      - expr: sum(http_requests_total)
    options:
      colorMode: value
      graphMode: area
      reduceOptions:
        calcs:
          - lastNotNull

# Table Panel
panels:
  - type: table
    title: Error Rates
    targets:
      - expr: sum(rate(http_errors_total[5m])) by (type)
    options:
      showHeader: true
      sortBy:
        - desc: true
          displayName: Value
```

## API Examples
```bash
# Authentication
curl -H "Authorization: Bearer YOUR_API_KEY" \      # Access Grafana API with API key
     http://localhost:3000/api/dashboards/home      # Get home dashboard info

# Create Dashboard
curl -X POST \                                      # Create new dashboard via API
     -H "Content-Type: application/json" \          # Specify JSON content type
     -H "Authorization: Bearer YOUR_API_KEY" \      # Authenticate request
     http://localhost:3000/api/dashboards/db \      # Dashboard endpoint
     -d @dashboard.json                            # Dashboard configuration file

# Get Data Source
curl -H "Authorization: Bearer YOUR_API_KEY" \      # Get data source configuration
     http://localhost:3000/api/datasources/name/prometheus  # Query Prometheus data source
```

## Best Practices

1. **Dashboard Organization**
```yaml
# Folder Structure
General/
  ├── System Overview
  ├── User Analytics
Production/
  ├── Service Health
  ├── Error Rates
Development/
  ├── Testing Metrics
  └── Build Status

# Naming Conventions
{Environment}-{Application}-{Metric Type}
Example: prod-userservice-performance
```

2. **Panel Layout**
```yaml
# Standard Layout
Row 1: Overview metrics (stat panels)
Row 2: Time series graphs
Row 3: Detailed tables
Row 4: Logs and traces

# Panel Sizing
Small panels: 6 units wide (half width)
Medium panels: 12 units wide (full width)
Large panels: 24 units wide (double width)
```

3. **Query Optimization**
```sql
# Use Recording Rules
record: job:request_latency_seconds:rate5m          # Pre-compute expensive queries
expr: rate(request_latency_seconds_count[5m])       # Store results for faster access

# Use Labels Efficiently
sum without (instance) (rate(http_requests_total{job="api"}[5m]))  # Remove unnecessary labels

# Aggregate Where Possible
sum by (status_code) (rate(http_requests_total[5m]))  # Group metrics to reduce data points
```

4. **Alert Configuration**
```yaml
# Alert Levels
severity:
  critical:
    priority: P1
    notification: immediate
  warning:
    priority: P2
    notification: delayed
  info:
    priority: P3
    notification: digest

# Alert Grouping
groups:
  - name: availability
    rules:
      - alert: ServiceDown
      - alert: HighErrorRate
  - name: performance
    rules:
      - alert: HighLatency
      - alert: SlowQueries
```

5. **Dashboard Variables**
```yaml
# Common Variable Types
- Datasource: Switch between data sources
- Interval: Time aggregation intervals
- Environment: prod, staging, dev
- Service: List of services
- Instance: List of instances

# Variable Dependencies
service -> instance -> metric
environment -> cluster -> node
```

## Monitoring Templates
```yaml
# Service Dashboard
Panels:
  - Request Rate
  - Error Rate
  - Latency (p95, p99)
  - Resource Usage (CPU, Memory)
  - Active Users
  - Business Metrics

# Infrastructure Dashboard
Panels:
  - Node Status
  - CPU Usage
  - Memory Usage
  - Disk Usage
  - Network Traffic
  - System Load

# Application Dashboard
Panels:
  - Application Health
  - Response Times
  - Error Rates
  - Database Connections
  - Cache Hit Ratio
  - Queue Length
```

## Additional Resources

- [Grafana Documentation](https://grafana.com/docs/)
- [Grafana Tutorials](https://grafana.com/tutorials/)
- [Grafana Community](https://community.grafana.com/)
- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)
- [PromQL Cheat Sheet](https://promlabs.com/promql-cheat-sheet/)
- [DevOps Glossary](../cheatsheets/devops_glossary.md)
