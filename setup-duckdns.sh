#!/bin/bash
# setup-duckdns.sh - DuckDNS 도메인 설정 스크립트

echo "🦆 DuckDNS 도메인 설정 시작..."

# 사용자 입력
read -p "📝 DuckDNS 도메인을 입력하세요 (예: gitvisualizer): " SUBDOMAIN
read -p "🔑 DuckDNS 토큰을 입력하세요: " TOKEN

FULL_DOMAIN="${SUBDOMAIN}.duckdns.org"

echo "🌐 설정할 도메인: $FULL_DOMAIN"

# IP 업데이트 (초기 설정)
curl "https://www.duckdns.org/update?domains=${SUBDOMAIN}&token=${TOKEN}&ip="

if [ $? -eq 0 ]; then
    echo "✅ DuckDNS 도메인 설정 완료!"
    echo "🌐 도메인: https://${FULL_DOMAIN}"
    
    # 자동 IP 업데이트 크론잡 설정
    echo "🔄 자동 IP 업데이트 설정 중..."
    
    # 크론잡 추가
    (crontab -l 2>/dev/null; echo "*/5 * * * * curl -s 'https://www.duckdns.org/update?domains=${SUBDOMAIN}&token=${TOKEN}&ip=' >/dev/null 2>&1") | crontab -
    
    echo "✅ 5분마다 IP 자동 업데이트 설정 완료"
    
    echo ""
    echo "📋 Render 설정 안내:"
    echo "1. Render 대시보드 > Settings > Custom Domains"
    echo "2. 'Add Custom Domain' 클릭"
    echo "3. 도메인 입력: ${FULL_DOMAIN}"
    echo "4. DNS 설정: CNAME 레코드 추가"
    echo "   Name: ${SUBDOMAIN}"
    echo "   Target: your-app.onrender.com"
    
else
    echo "❌ DuckDNS 설정 실패. 토큰과 도메인을 확인해주세요."
fi 