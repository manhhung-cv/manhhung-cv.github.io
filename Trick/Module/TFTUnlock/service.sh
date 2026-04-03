#!/system/bin/sh
MODDIR=${0%/*}

# Đợi 45 giây để hệ thống hoàn tất quá trình khởi động và đọc thẻ nhớ
sleep 45

# Xác định đường dẫn file Game.cfg của TFT
FILE1="/data/data/com.riotgames.league.teamfighttactics/files/Documents/Config/Game.cfg"
FILE2="/storage/emulated/0/Android/data/com.riotgames.league.teamfighttactics/files/Documents/Config/Game.cfg"

# Hàm chỉnh sửa cấu hình Game.cfg
patch_cfg() {
    local config_file=$1
    if [ -f "$config_file" ]; then
        # Ép khung hình 60 FPS
        sed -i 's/TargetFps=.*/TargetFps=60/g' "$config_file"
        
        # Tắt V-Sync
        sed -i 's/WaitForVerticalSync=.*/WaitForVerticalSync=0/g' "$config_file"
        
        # Hạ toàn bộ chất lượng đồ họa xuống mức thấp nhất (0)
        sed -i 's/CharacterQuality=.*/CharacterQuality=0/g' "$config_file"
        sed -i 's/EnvironmentQuality=.*/EnvironmentQuality=0/g' "$config_file"
        sed -i 's/EffectsQuality=.*/EffectsQuality=0/g' "$config_file"
        sed -i 's/ShadowQuality=.*/ShadowQuality=0/g' "$config_file"
        
        # Tắt xử lý hậu kỳ (viền, nhòe)
        sed -i 's/EnablePostProcessing=.*/EnablePostProcessing=0/g' "$config_file"
    fi
}

# Thực thi hàm
patch_cfg "$FILE1"
patch_cfg "$FILE2"