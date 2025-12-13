# Envoy Proxy & Monitoring Stack

This directory contains the configuration for the **Envoy Proxy**, along with a monitoring stack using **Prometheus** and **Grafana**.

## Project Structure

```
envoy-proxy/
├── docker-compose.yaml      # Runs Envoy, Prometheus, and Grafana
├── envoy/
│   ├── envoy.yaml           # Main Envoy config (Static Listeners + Dynamic CDS)
│   └── cds.yaml             # Cluster Discovery Service (Dynamic Cluster + Endpoints)
├── prometheus/
│   └── prometheus.yml       # Prometheus scraping configuration
├── grafana/
│   └── provisioning/        # Grafana datasources and dashboards
└── README.md
```

## Services & Ports

| Service | Port | Description |
| :--- | :--- | :--- |
| **Envoy Proxy** | `10000` | The load balancer entry point for your backend services. |
| **Envoy Admin** | `9901` | Administration interface for Envoy. |
| **Prometheus** | `9090` | Metrics collection database. |
| **Grafana** | `3000` | Visualization dashboard. Default login: `admin`/`admin`. |

## How It Works

### 1. Envoy Proxy
*   **Listener**: Listens on port `10000` and forwards traffic to the `backend_service` cluster.
*   **Dynamic Configuration**: Uses `cds.yaml` to discover backend instances. You can update `cds.yaml` to add/remove backend instances without restarting Envoy.
*   **Health Checks**: Performs active HTTP health checks on backend instances.
*   **Outlier Detection**: Automatically ejects failing instances.

### 2. Monitoring
*   **Prometheus** scrapes metrics from Envoy's admin interface (`/stats/prometheus`) every 5 seconds (configured in `prometheus.yml`).
*   **Grafana** connects to Prometheus as a datasource and provides pre-provisioned dashboards to visualize Envoy's performance (RPS, Success Rates, Latency, etc.).

## How to Add/Remove Backend Instances

To register a new backend instance (e.g., running on port `5006`), edit **`envoy/cds.yaml`**.

Find the `load_assignment` -> `endpoints` -> `lb_endpoints` section and add your instance:

```yaml
      - endpoint:
          address:
            socket_address:
              address: host.docker.internal  # Or your LAN IP if needed
              port_value: 5006
```

**Envoy will automatically reload this configuration.**

## Troubleshooting

### "No Healthy Upstream"
*   **Check Instances**: Ensure your backend services are running.
*   **Health Checks**: Envoy checks `GET /` on your backend. If it fails, the instance is marked unhealthy.
*   **Connectivity**: If `host.docker.internal` fails, try using your machine's **LAN IPv4 Address**.

### Grafana Dashboards Not Showing
*   Ensure the `grafana/provisioning` directory is correctly mounted in `docker-compose.yaml`.
*   Check Grafana logs: `docker-compose logs grafana`.

## Commands

*   **Start Stack**: `docker-compose up -d`
*   **Stop Stack**: `docker-compose down`
*   **View Logs**: `docker-compose logs -f`
