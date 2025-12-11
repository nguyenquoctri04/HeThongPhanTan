# Envoy Proxy Configuration

This directory contains the configuration for the Envoy Proxy used to load balance traffic to your **Backend Service**.

## Project Structure

```
envoy-proxy/
├── docker-compose.yaml      # Config to run Envoy via Docker
├── envoy/
│   ├── envoy.yaml           # Main Envoy config (Static Listeners + Dynamic CDS)
│   └── cds.yaml             # Cluster Discovery Service (Dynamic Cluster + Endpoints)
└── README.md
```

## How It Works

1.  **Envoy** starts and reads `envoy.yaml`.
2.  `envoy.yaml` defines a **Listener** on port `10000`.
3.  It points to `cds.yaml` for **Cluster** configuration (CDS - Cluster Discovery Service).
4.  `cds.yaml` defines the `backend_service` cluster, including:
    *   **Load Balancing Policy**: Round Robin.
    *   **Health Checks**: Active HTTP health checks to `/`.
    *   **Outlier Detection**: Automatically ejects failing instances (Passive Health Check).
    *   **Endpoints**: The list of backend targets (IPs and Ports).

## How to Add/Remove Instances

To register a new instance (e.g., running on port `5006`), edit **`envoy/cds.yaml`**.

Find the `load_assignment` -> `endpoints` -> `lb_endpoints` section and add your instance:

```yaml
      - endpoint:
          address:
            socket_address:
              address: host.docker.internal  # Or your LAN IP if needed
              port_value: 5006
```

**Envoy will automatically reload this configuration without restarting.**

## Troubleshooting

### "No Healthy Upstream"
*   **Check Instances**: Ensure your backend services are running on the ports specified (e.g., 5000-5005).
*   **Health Check Failure**: Envoy checks `GET /` on your backend. If it returns 500 or takes too long, the instance is marked unhealthy.
*   **Outlier Ejection**: If an instance returns 5xx errors, it will be temporarily ejected.
*   **Connectivity**: If `host.docker.internal` doesn't work (common on some Windows setups or IPv6), try using your machine's **LAN IPv4 Address** (e.g., `192.168.1.18`).

### Commands
*   **Start Envoy**: `docker-compose up -d`
*   **View Logs**: `docker-compose logs -f`
*   **Reload Config**: Automatic (File Watcher).
