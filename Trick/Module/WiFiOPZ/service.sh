#!/system/bin/sh
MODDIR=${0%/*}

# Đợi hệ thống khởi động xong hoàn toàn (tránh lỗi xung đột)
sleep 30

# Cố định TTL của IPv4 về 65 (hoặc 64 tùy nhà mạng, thường 65 là tốt nhất để bypass)
iptables -t mangle -I POSTROUTING -j TTL --ttl-set 65

# (Tùy chọn) Cố định cho cả IPv6 nếu nhà mạng của bạn quản lý khắt khe qua IPv6
ip6tables -t mangle -I POSTROUTING -j HL --hl-set 65