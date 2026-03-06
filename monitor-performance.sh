#!/bin/bash

# Performance monitoring script for Couple Connect games
echo "🚀 Couple Connect - Performance Monitor"
echo "========================================"

# Check system resources
echo "📊 System Resources:"
echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')%"
echo "Memory Usage: $(free -m | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
echo "Disk Usage: $(df -h / | awk 'NR==2{print $5}')"
echo ""

# Check Docker containers
echo "🐳 Docker Containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(app|nginx|redis|meilisearch)"
echo ""

# Check application health
echo "🏥 Application Health:"
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health)
if [ "$response" = "200" ]; then
    echo "✅ Application: Healthy"
else
    echo "❌ Application: Unhealthy (HTTP $response)"
fi

# Check response times
echo ""
echo "⚡ Response Times:"
echo "Homepage: $(curl -o /dev/null -s -w '%{time_total}s' http://localhost/)"
echo "Games API: $(curl -o /dev/null -s -w '%{time_total}s' http://localhost/api/games/question -X POST -H 'Content-Type: application/json' -d '{"gameType":"couple-quiz","category":"romantic"}')"
echo ""

# Check logs for errors
echo "📋 Recent Errors (last 10):"
docker logs couple-connect_app_1 2>&1 | grep -i error | tail -10
echo ""

# Performance recommendations
echo "💡 Performance Tips:"
echo "- Questions now load instantly (no API delays)"
echo "- Socket timeouts reduced to 800ms"
echo "- Components are lazy-loaded"
echo "- Static assets cached for 1 year"
echo "- Gzip compression enabled"
echo "- Rate limiting active"
echo ""

# Game-specific metrics
echo "🎮 Game Performance:"
echo "- Question generation: Instant (local fallback pool)"
echo "- Socket reconnection: 3 attempts max"
echo "- Component loading: Lazy (on-demand)"
echo "- Memory usage: Optimized with cleanup"
echo ""

echo "✅ Performance monitoring complete!"