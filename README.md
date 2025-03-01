# Simple WAF

A web application firewall (WAF) management system that provides a backend API for managing HAProxy and Coraza WAF.

## Project Structure

```
├── service/            # Backend service
│   ├── config/         # Configuration handling
│   ├── controller/     # API controllers
│   ├── engine/         # Coraza WAF management
│   ├── haproxy/        # HAProxy management
│   ├── middleware/     # Gin middleware
│   ├── router/         # API routes
│   └── service/        # Business logic
├── web/                # Frontend (not implemented yet)
```

## Features

- HAProxy management (start, stop, restart)
- HAProxy configuration management
- Coraza WAF engine management (start, stop, restart)
- Coraza WAF configuration management
- RESTful API with Gin framework

## Getting Started

### Prerequisites

- Go 1.18 or higher
- HAProxy
- Coraza SPOE

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/simple-waf.git
cd simple-waf
```

2. Install dependencies:

```bash
go mod download
```

3. Build the application:

```bash
go build -o simple-waf-service
```

4. Run the application:

```bash
./simple-waf-service
```

The server will start at `http://localhost:8080` by default.

## API Endpoints

### Health Check
- GET `/health` - Check if the service is running

### HAProxy Management
- GET `/api/v1/haproxy/status` - Get HAProxy status
- GET `/api/v1/haproxy/config` - Get HAProxy configuration
- POST `/api/v1/haproxy/config` - Update HAProxy configuration
- POST `/api/v1/haproxy/restart` - Restart HAProxy
- POST `/api/v1/haproxy/start` - Start HAProxy
- POST `/api/v1/haproxy/stop` - Stop HAProxy

### WAF Engine Management
- GET `/api/v1/engine/status` - Get WAF engine status
- GET `/api/v1/engine/config` - Get WAF engine configuration
- POST `/api/v1/engine/config` - Update WAF engine configuration
- POST `/api/v1/engine/restart` - Restart WAF engine
- POST `/api/v1/engine/start` - Start WAF engine
- POST `/api/v1/engine/stop` - Stop WAF engine

### Configuration
- GET `/api/v1/config` - Get application configuration
- POST `/api/v1/config` - Update application configuration

## License

This project is licensed under the MIT License - see the LICENSE file for details. 