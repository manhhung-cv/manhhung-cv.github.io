#!/system/bin/sh
MODDIR=${0%/*}

# Đợi hệ thống khởi động hoàn tất
until [ "$(getprop sys.boot_completed)" = 1 ]; do
    sleep 2
done

# Đợi thêm một chút để mạng ổn định
sleep 10

# Áp dụng quy tắc Set TTL 65 cho IPv4
iptables -t mangle -A POSTROUTING -j TTL --ttl-set 65
iptables -t mangle -I PREROUTING -j TTL --ttl-set 65

# Áp dụng quy tắc Set HL 65 cho IPv6 (Rất quan trọng vì nhiều nhà mạng dùng IPv6)
ip6tables -t mangle -A POSTROUTING -j HL --hl-set 65
ip6tables -t mangle -I PREROUTING -j HL --hl-set 65