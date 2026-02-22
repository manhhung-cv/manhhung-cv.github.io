  const database = {
            // --- SERIES 17 (Dự kiến 2025) ---
            "iphone_17_pro_max": {
                name: "iPhone 17 Pro Max",
                release_date: "19/09/2025",
                default_ios: "iOS 19.0", // Đã chỉnh lại iOS logic thực tế (user sample ghi 26.0)
                chip_model: "A19 Pro",
                display: { size: "6.9 inch", resolution: "2868 x 1320", tech: "LTPO OLED", refresh_rate: "120Hz" },
                hardware: { cpu: "A19 Pro", gpu: "6-core", ram: "12GB", storage_options: ["256GB", "512GB", "1TB"] },
                battery: { capacity: "4850 mAh", tech: "Li-Ion", charging: "45W", port: "USB-C" },
                features: ["Triple 48MP", "Titanium", "AI Max"],
                jailbreak_info: { type: "check_os_based" }
            },
            "iphone_17_pro": {
                name: "iPhone 17 Pro",
                release_date: "19/09/2025",
                default_ios: "iOS 19.0",
                chip_model: "A19 Pro",
                display: { size: "6.3 inch", resolution: "2622 x 1206", tech: "LTPO OLED", refresh_rate: "120Hz" },
                hardware: { cpu: "A19 Pro", gpu: "6-core", ram: "12GB", storage_options: ["256GB", "1TB"] },
                battery: { capacity: "3800 mAh", tech: "Li-Ion", charging: "45W", port: "USB-C" },
                features: ["Triple 48MP", "Titanium", "AI Button"],
                jailbreak_info: { type: "check_os_based" }
            },
            "iphone_17_air": { // Phiên bản Slim/Air tin đồn
                name: "iPhone 17 Air",
                release_date: "19/09/2025",
                default_ios: "iOS 19.0",
                chip_model: "A19",
                display: { size: "6.6 inch", resolution: "2740 x 1260", tech: "OLED", refresh_rate: "120Hz" },
                hardware: { cpu: "A19", gpu: "5-core", ram: "8GB", storage_options: ["128GB", "512GB"] },
                battery: { capacity: "3500 mAh", tech: "Li-Ion", charging: "30W", port: "USB-C" },
                features: ["Ultra Thin", "Single 48MP", "FaceID 2.0"],
                jailbreak_info: { type: "check_os_based" }
            },
            "iphone_17": {
                name: "iPhone 17",
                release_date: "19/09/2025",
                default_ios: "iOS 19.0",
                chip_model: "A19",
                display: { size: "6.1 inch", resolution: "2556 x 1179", tech: "OLED", refresh_rate: "120Hz" },
                hardware: { cpu: "A19", gpu: "5-core", ram: "8GB", storage_options: ["128GB", "512GB"] },
                battery: { capacity: "3600 mAh", tech: "Li-Ion", charging: "30W", port: "USB-C" },
                features: ["Action Button", "AI Features"],
                jailbreak_info: { type: "check_os_based" }
            },

            // --- SERIES 16 (2024) ---
            "iphone_16_pro_max": {
                name: "iPhone 16 Pro Max",
                release_date: "20/09/2024",
                default_ios: "iOS 18.0",
                chip_model: "A18 Pro",
                display: { size: "6.9 inch", resolution: "2868 x 1320", tech: "LTPO OLED", refresh_rate: "120Hz" },
                hardware: { cpu: "A18 Pro", gpu: "6-core", ram: "8GB", storage_options: ["256GB", "1TB"] },
                battery: { capacity: "4685 mAh", tech: "Li-Ion", charging: "45W", port: "USB-C" },
                features: ["Camera Control", "Titanium", "5x Tele"],
                jailbreak_info: { type: "check_os_based" }
            },
            "iphone_16_pro": {
                name: "iPhone 16 Pro",
                release_date: "20/09/2024",
                default_ios: "iOS 18.0",
                chip_model: "A18 Pro",
                display: { size: "6.3 inch", resolution: "2622 x 1206", tech: "LTPO OLED", refresh_rate: "120Hz" },
                hardware: { cpu: "A18 Pro", gpu: "6-core", ram: "8GB", storage_options: ["128GB", "1TB"] },
                battery: { capacity: "3582 mAh", tech: "Li-Ion", charging: "45W", port: "USB-C" },
                features: ["Camera Control", "Titanium", "5x Tele"],
                jailbreak_info: { type: "check_os_based" }
            },
            "iphone_16_plus": {
                name: "iPhone 16 Plus",
                release_date: "20/09/2024",
                default_ios: "iOS 18.0",
                chip_model: "A18",
                display: { size: "6.7 inch", resolution: "2796 x 1290", tech: "OLED", refresh_rate: "60Hz" },
                hardware: { cpu: "A18", gpu: "5-core", ram: "8GB", storage_options: ["128GB", "512GB"] },
                battery: { capacity: "4674 mAh", tech: "Li-Ion", charging: "25W", port: "USB-C" },
                features: ["Action Button", "Camera Control"],
                jailbreak_info: { type: "check_os_based" }
            },
            "iphone_16": {
                name: "iPhone 16",
                release_date: "20/09/2024",
                default_ios: "iOS 18.0",
                chip_model: "A18",
                display: { size: "6.1 inch", resolution: "2556 x 1179", tech: "OLED", refresh_rate: "60Hz" },
                hardware: { cpu: "A18", gpu: "5-core", ram: "8GB", storage_options: ["128GB", "512GB"] },
                battery: { capacity: "3561 mAh", tech: "Li-Ion", charging: "25W", port: "USB-C" },
                features: ["Action Button", "Camera Control"],
                jailbreak_info: { type: "check_os_based" }
            },

            // --- SERIES 15 (2023) ---
            "iphone_15_pro_max": {
                name: "iPhone 15 Pro Max",
                release_date: "22/09/2023",
                default_ios: "iOS 17.0",
                chip_model: "A17 Pro",
                display: { size: "6.7 inch", resolution: "2796 x 1290", tech: "LTPO OLED", refresh_rate: "120Hz" },
                hardware: { cpu: "A17 Pro", gpu: "6-core", ram: "8GB", storage_options: ["256GB", "1TB"] },
                battery: { capacity: "4441 mAh", tech: "Li-Ion", charging: "20W", port: "USB-C" },
                features: ["Titanium", "Action Button", "USB-C"],
                jailbreak_info: { type: "check_os_based" }
            },
            "iphone_15_pro": {
                name: "iPhone 15 Pro",
                release_date: "22/09/2023",
                default_ios: "iOS 17.0",
                chip_model: "A17 Pro",
                display: { size: "6.1 inch", resolution: "2556 x 1179", tech: "LTPO OLED", refresh_rate: "120Hz" },
                hardware: { cpu: "A17 Pro", gpu: "6-core", ram: "8GB", storage_options: ["128GB", "1TB"] },
                battery: { capacity: "3274 mAh", tech: "Li-Ion", charging: "20W", port: "USB-C" },
                features: ["Titanium", "Action Button", "USB-C"],
                jailbreak_info: { type: "check_os_based" }
            },
            "iphone_15_plus": {
                name: "iPhone 15 Plus",
                release_date: "22/09/2023",
                default_ios: "iOS 17.0",
                chip_model: "A16 Bionic",
                display: { size: "6.7 inch", resolution: "2796 x 1290", tech: "OLED", refresh_rate: "60Hz" },
                hardware: { cpu: "A16", gpu: "5-core", ram: "6GB", storage_options: ["128GB", "512GB"] },
                battery: { capacity: "4383 mAh", tech: "Li-Ion", charging: "20W", port: "USB-C" },
                features: ["Dynamic Island", "48MP Main"],
                jailbreak_info: { type: "check_os_based" }
            },
            "iphone_15": {
                name: "iPhone 15",
                release_date: "22/09/2023",
                default_ios: "iOS 17.0",
                chip_model: "A16 Bionic",
                display: { size: "6.1 inch", resolution: "2556 x 1179", tech: "OLED", refresh_rate: "60Hz" },
                hardware: { cpu: "A16", gpu: "5-core", ram: "6GB", storage_options: ["128GB", "512GB"] },
                battery: { capacity: "3349 mAh", tech: "Li-Ion", charging: "20W", port: "USB-C" },
                features: ["Dynamic Island", "48MP Main"],
                jailbreak_info: { type: "check_os_based" }
            },

            // --- SERIES 14 (2022) ---
            "iphone_14_pro_max": {
                name: "iPhone 14 Pro Max",
                release_date: "16/09/2022",
                default_ios: "iOS 16.0",
                chip_model: "A16 Bionic",
                display: { size: "6.7 inch", resolution: "2796 x 1290", tech: "LTPO OLED", refresh_rate: "120Hz" },
                hardware: { cpu: "A16", gpu: "5-core", ram: "6GB", storage_options: ["128GB", "1TB"] },
                battery: { capacity: "4323 mAh", tech: "Li-Ion", charging: "27W", port: "Lightning" },
                features: ["Dynamic Island", "Always-On Display"],
                jailbreak_info: { type: "check_os_based" }
            },
            "iphone_14_pro": {
                name: "iPhone 14 Pro",
                release_date: "16/09/2022",
                default_ios: "iOS 16.0",
                chip_model: "A16 Bionic",
                display: { size: "6.1 inch", resolution: "2556 x 1179", tech: "LTPO OLED", refresh_rate: "120Hz" },
                hardware: { cpu: "A16", gpu: "5-core", ram: "6GB", storage_options: ["128GB", "1TB"] },
                battery: { capacity: "3200 mAh", tech: "Li-Ion", charging: "27W", port: "Lightning" },
                features: ["Dynamic Island", "Always-On Display"],
                jailbreak_info: { type: "check_os_based" }
            },
            "iphone_14_plus": {
                name: "iPhone 14 Plus",
                release_date: "07/10/2022",
                default_ios: "iOS 16.0",
                chip_model: "A15 Bionic",
                display: { size: "6.7 inch", resolution: "2778 x 1284", tech: "OLED", refresh_rate: "60Hz" },
                hardware: { cpu: "A15", gpu: "5-core", ram: "6GB", storage_options: ["128GB", "512GB"] },
                battery: { capacity: "4325 mAh", tech: "Li-Ion", charging: "20W", port: "Lightning" },
                features: ["Crash Detection", "Action Mode"],
                jailbreak_info: { type: "check_os_based" }
            },
            "iphone_14": {
                name: "iPhone 14",
                release_date: "16/09/2022",
                default_ios: "iOS 16.0",
                chip_model: "A15 Bionic",
                display: { size: "6.1 inch", resolution: "2532 x 1170", tech: "OLED", refresh_rate: "60Hz" },
                hardware: { cpu: "A15", gpu: "5-core", ram: "6GB", storage_options: ["128GB", "512GB"] },
                battery: { capacity: "3279 mAh", tech: "Li-Ion", charging: "20W", port: "Lightning" },
                features: ["Crash Detection", "Action Mode"],
                jailbreak_info: { type: "check_os_based" }
            },

            // --- SERIES SE (Special Edition) ---
            "iphone_se_3": {
                name: "iPhone SE (3rd Gen)",
                release_date: "18/03/2022",
                default_ios: "iOS 15.4",
                chip_model: "A15 Bionic",
                display: { size: "4.7 inch", resolution: "1334 x 750", tech: "LCD", refresh_rate: "60Hz" },
                hardware: { cpu: "A15", gpu: "4-core", ram: "4GB", storage_options: ["64GB", "256GB"] },
                battery: { capacity: "2018 mAh", tech: "Li-Ion", charging: "20W", port: "Lightning" },
                features: ["TouchID", "5G Capable"],
                jailbreak_info: { type: "check_os_based" }
            },
            "iphone_se_2": {
                name: "iPhone SE (2nd Gen)",
                release_date: "24/04/2020",
                default_ios: "iOS 13.4",
                chip_model: "A13 Bionic",
                display: { size: "4.7 inch", resolution: "1334 x 750", tech: "LCD", refresh_rate: "60Hz" },
                hardware: { cpu: "A13", gpu: "4-core", ram: "3GB", storage_options: ["64GB", "256GB"] },
                battery: { capacity: "1821 mAh", tech: "Li-Ion", charging: "18W", port: "Lightning" },
                features: ["TouchID", "Single Cam"],
                jailbreak_info: { type: "check_os_based" }
            },
            "iphone_se_1": {
                name: "iPhone SE (1st Gen)",
                release_date: "31/03/2016",
                default_ios: "iOS 9.3",
                chip_model: "A9",
                display: { size: "4.0 inch", resolution: "1136 x 640", tech: "LCD", refresh_rate: "60Hz" },
                hardware: { cpu: "A9", gpu: "6-core", ram: "2GB", storage_options: ["16GB", "128GB"] },
                battery: { capacity: "1624 mAh", tech: "Li-Ion", charging: "5W", port: "Lightning" },
                features: ["TouchID", "Compact Design"],
                jailbreak_info: { type: "check_os_based", is_checkm8: true }
            },

            // --- SERIES 13 (2021) ---
            "iphone_13_pro_max": {
                name: "iPhone 13 Pro Max",
                release_date: "24/09/2021",
                default_ios: "iOS 15.0",
                chip_model: "A15 Bionic",
                display: { size: "6.7 inch", resolution: "2778 x 1284", tech: "LTPO OLED", refresh_rate: "120Hz" },
                hardware: { cpu: "A15", gpu: "5-core", ram: "6GB", storage_options: ["128GB", "1TB"] },
                battery: { capacity: "4352 mAh", tech: "Li-Ion", charging: "27W", port: "Lightning" },
                features: ["ProMotion", "Cinematic Mode"],
                jailbreak_info: { type: "check_os_based" }
            },
            "iphone_13_pro": {
                name: "iPhone 13 Pro",
                release_date: "24/09/2021",
                default_ios: "iOS 15.0",
                chip_model: "A15 Bionic",
                display: { size: "6.1 inch", resolution: "2532 x 1170", tech: "LTPO OLED", refresh_rate: "120Hz" },
                hardware: { cpu: "A15", gpu: "5-core", ram: "6GB", storage_options: ["128GB", "1TB"] },
                battery: { capacity: "3095 mAh", tech: "Li-Ion", charging: "23W", port: "Lightning" },
                features: ["ProMotion", "Cinematic Mode"],
                jailbreak_info: { type: "check_os_based" }
            },
            "iphone_13": {
                name: "iPhone 13",
                release_date: "24/09/2021",
                default_ios: "iOS 15.0",
                chip_model: "A15 Bionic",
                display: { size: "6.1 inch", resolution: "2532 x 1170", tech: "OLED", refresh_rate: "60Hz" },
                hardware: { cpu: "A15", gpu: "4-core", ram: "4GB", storage_options: ["128GB", "512GB"] },
                battery: { capacity: "3240 mAh", tech: "Li-Ion", charging: "20W", port: "Lightning" },
                features: ["Diagonal Cam", "FaceID"],
                jailbreak_info: { type: "check_os_based" }
            },
            "iphone_13_mini": {
                name: "iPhone 13 mini",
                release_date: "24/09/2021",
                default_ios: "iOS 15.0",
                chip_model: "A15 Bionic",
                display: { size: "5.4 inch", resolution: "2340 x 1080", tech: "OLED", refresh_rate: "60Hz" },
                hardware: { cpu: "A15", gpu: "4-core", ram: "4GB", storage_options: ["128GB", "512GB"] },
                battery: { capacity: "2438 mAh", tech: "Li-Ion", charging: "18W", port: "Lightning" },
                features: ["Mini Form", "FaceID"],
                jailbreak_info: { type: "check_os_based" }
            },

            // --- SERIES 12 (2020) ---
            "iphone_12_pro_max": {
                name: "iPhone 12 Pro Max",
                release_date: "13/11/2020",
                default_ios: "iOS 14.1",
                chip_model: "A14 Bionic",
                display: { size: "6.7 inch", resolution: "2778 x 1284", tech: "OLED", refresh_rate: "60Hz" },
                hardware: { cpu: "A14", gpu: "4-core", ram: "6GB", storage_options: ["128GB", "512GB"] },
                battery: { capacity: "3687 mAh", tech: "Li-Ion", charging: "20W", port: "Lightning" },
                features: ["LiDAR", "Flat Design", "5G"],
                jailbreak_info: { type: "check_os_based" }
            },
            "iphone_12_pro": {
                name: "iPhone 12 Pro",
                release_date: "23/10/2020",
                default_ios: "iOS 14.1",
                chip_model: "A14 Bionic",
                display: { size: "6.1 inch", resolution: "2532 x 1170", tech: "OLED", refresh_rate: "60Hz" },
                hardware: { cpu: "A14", gpu: "4-core", ram: "6GB", storage_options: ["128GB", "512GB"] },
                battery: { capacity: "2815 mAh", tech: "Li-Ion", charging: "20W", port: "Lightning" },
                features: ["LiDAR", "Flat Design", "5G"],
                jailbreak_info: { type: "check_os_based" }
            },
            "iphone_12": {
                name: "iPhone 12",
                release_date: "23/10/2020",
                default_ios: "iOS 14.1",
                chip_model: "A14 Bionic",
                display: { size: "6.1 inch", resolution: "2532 x 1170", tech: "OLED", refresh_rate: "60Hz" },
                hardware: { cpu: "A14", gpu: "4-core", ram: "4GB", storage_options: ["64GB", "256GB"] },
                battery: { capacity: "2815 mAh", tech: "Li-Ion", charging: "20W", port: "Lightning" },
                features: ["Dual Cam", "Flat Design", "5G"],
                jailbreak_info: { type: "check_os_based" }
            },
            "iphone_12_mini": {
                name: "iPhone 12 mini",
                release_date: "13/11/2020",
                default_ios: "iOS 14.1",
                chip_model: "A14 Bionic",
                display: { size: "5.4 inch", resolution: "2340 x 1080", tech: "OLED", refresh_rate: "60Hz" },
                hardware: { cpu: "A14", gpu: "4-core", ram: "4GB", storage_options: ["64GB", "256GB"] },
                battery: { capacity: "2227 mAh", tech: "Li-Ion", charging: "15W", port: "Lightning" },
                features: ["Mini Form", "5G"],
                jailbreak_info: { type: "check_os_based" }
            },

            // --- SERIES 11 (2019) ---
            "iphone_11_pro_max": {
                name: "iPhone 11 Pro Max",
                release_date: "20/09/2019",
                default_ios: "iOS 13.0",
                chip_model: "A13 Bionic",
                display: { size: "6.5 inch", resolution: "2688 x 1242", tech: "OLED", refresh_rate: "60Hz" },
                hardware: { cpu: "A13", gpu: "4-core", ram: "4GB", storage_options: ["64GB", "512GB"] },
                battery: { capacity: "3969 mAh", tech: "Li-Ion", charging: "18W", port: "Lightning" },
                features: ["Triple Cam", "Night Mode"],
                jailbreak_info: { type: "check_os_based" }
            },
            "iphone_11_pro": {
                name: "iPhone 11 Pro",
                release_date: "20/09/2019",
                default_ios: "iOS 13.0",
                chip_model: "A13 Bionic",
                display: { size: "5.8 inch", resolution: "2436 x 1125", tech: "OLED", refresh_rate: "60Hz" },
                hardware: { cpu: "A13", gpu: "4-core", ram: "4GB", storage_options: ["64GB", "512GB"] },
                battery: { capacity: "3046 mAh", tech: "Li-Ion", charging: "18W", port: "Lightning" },
                features: ["Triple Cam", "Matte Glass"],
                jailbreak_info: { type: "check_os_based" }
            },
            "iphone_11": {
                name: "iPhone 11",
                release_date: "20/09/2019",
                default_ios: "iOS 13",
                chip_model: "A13",
                display: { size: "6.1 inch", resolution: "1792 x 828", tech: "LCD", refresh_rate: "60Hz" },
                hardware: { cpu: "A13", gpu: "4-core", ram: "4GB", storage_options: ["64GB", "256GB"] },
                battery: { capacity: "3110 mAh", tech: "Li-Ion", charging: "18W", port: "Lightning" },
                features: ["FaceID", "Dual Cam"],
                jailbreak_info: { type: "check_os_based" }
            },

            // --- SERIES X/XS/XR (2017-2018) ---
            "iphone_xs_max": {
                name: "iPhone XS Max",
                release_date: "21/09/2018",
                default_ios: "iOS 12.0",
                chip_model: "A12 Bionic",
                display: { size: "6.5 inch", resolution: "2688 x 1242", tech: "OLED", refresh_rate: "60Hz" },
                hardware: { cpu: "A12", gpu: "4-core", ram: "4GB", storage_options: ["64GB", "512GB"] },
                battery: { capacity: "3174 mAh", tech: "Li-Ion", charging: "15W", port: "Lightning" },
                features: ["FaceID", "Smart HDR"],
                jailbreak_info: { type: "check_os_based" }
            },
            "iphone_xs": {
                name: "iPhone XS",
                release_date: "21/09/2018",
                default_ios: "iOS 12.0",
                chip_model: "A12 Bionic",
                display: { size: "5.8 inch", resolution: "2436 x 1125", tech: "OLED", refresh_rate: "60Hz" },
                hardware: { cpu: "A12", gpu: "4-core", ram: "4GB", storage_options: ["64GB", "512GB"] },
                battery: { capacity: "2658 mAh", tech: "Li-Ion", charging: "15W", port: "Lightning" },
                features: ["FaceID", "Smart HDR"],
                jailbreak_info: { type: "check_os_based" }
            },
            "iphone_xr": {
                name: "iPhone XR",
                release_date: "26/10/2018",
                default_ios: "iOS 12.0",
                chip_model: "A12 Bionic",
                display: { size: "6.1 inch", resolution: "1792 x 828", tech: "LCD", refresh_rate: "60Hz" },
                hardware: { cpu: "A12", gpu: "4-core", ram: "3GB", storage_options: ["64GB", "256GB"] },
                battery: { capacity: "2942 mAh", tech: "Li-Ion", charging: "15W", port: "Lightning" },
                features: ["FaceID", "Liquid Retina"],
                jailbreak_info: { type: "check_os_based" }
            },
            "iphone_x": {
                name: "iPhone X",
                release_date: "03/11/2017",
                default_ios: "iOS 11.1",
                chip_model: "A11 Bionic",
                display: { size: "5.8 inch", resolution: "2436 x 1125", tech: "OLED", refresh_rate: "60Hz" },
                hardware: { cpu: "A11", gpu: "3-core", ram: "3GB", storage_options: ["64GB", "256GB"] },
                battery: { capacity: "2716 mAh", tech: "Li-Ion", charging: "15W", port: "Lightning" },
                features: ["FaceID", "Notch", "First OLED"],
                jailbreak_info: { type: "check_os_based", is_checkm8: true }
            },

            // --- SERIES 8 (2017) ---
            "iphone_8_plus": {
                name: "iPhone 8 Plus",
                release_date: "22/09/2017",
                default_ios: "iOS 11.0",
                chip_model: "A11 Bionic",
                display: { size: "5.5 inch", resolution: "1920 x 1080", tech: "LCD", refresh_rate: "60Hz" },
                hardware: { cpu: "A11", gpu: "3-core", ram: "3GB", storage_options: ["64GB", "256GB"] },
                battery: { capacity: "2691 mAh", tech: "Li-Ion", charging: "15W", port: "Lightning" },
                features: ["TouchID", "Glass Back", "Wireless Charging"],
                jailbreak_info: { type: "check_os_based", is_checkm8: true }
            },
            "iphone_8": {
                name: "iPhone 8",
                release_date: "22/09/2017",
                default_ios: "iOS 11.0",
                chip_model: "A11 Bionic",
                display: { size: "4.7 inch", resolution: "1334 x 750", tech: "LCD", refresh_rate: "60Hz" },
                hardware: { cpu: "A11", gpu: "3-core", ram: "2GB", storage_options: ["64GB", "256GB"] },
                battery: { capacity: "1821 mAh", tech: "Li-Ion", charging: "15W", port: "Lightning" },
                features: ["TouchID", "Wireless Charging"],
                jailbreak_info: { type: "check_os_based", is_checkm8: true }
            },

            // --- SERIES 7 (2016) ---
            "iphone_7_plus": {
                name: "iPhone 7 Plus",
                release_date: "16/09/2016",
                default_ios: "iOS 10.0",
                chip_model: "A10 Fusion",
                display: { size: "5.5 inch", resolution: "1920 x 1080", tech: "LCD", refresh_rate: "60Hz" },
                hardware: { cpu: "A10", gpu: "6-core", ram: "3GB", storage_options: ["32GB", "128GB", "256GB"] },
                battery: { capacity: "2900 mAh", tech: "Li-Ion", charging: "10W", port: "Lightning" },
                features: ["Dual Cam", "Water Resistance"],
                jailbreak_info: { type: "check_os_based", is_checkm8: true }
            },
            "iphone_7": {
                name: "iPhone 7",
                release_date: "16/09/2016",
                default_ios: "iOS 10.0",
                chip_model: "A10 Fusion",
                display: { size: "4.7 inch", resolution: "1334 x 750", tech: "LCD", refresh_rate: "60Hz" },
                hardware: { cpu: "A10", gpu: "6-core", ram: "2GB", storage_options: ["32GB", "128GB", "256GB"] },
                battery: { capacity: "1960 mAh", tech: "Li-Ion", charging: "10W", port: "Lightning" },
                features: ["No Headphone Jack", "Water Resistance"],
                jailbreak_info: { type: "check_os_based", is_checkm8: true }
            },

            // --- SERIES 6S (2015) ---
            "iphone_6s_plus": {
                name: "iPhone 6s Plus",
                release_date: "25/09/2015",
                default_ios: "iOS 9.0",
                chip_model: "A9",
                display: { size: "5.5 inch", resolution: "1920 x 1080", tech: "LCD", refresh_rate: "60Hz" },
                hardware: { cpu: "A9", gpu: "6-core", ram: "2GB", storage_options: ["16GB", "64GB", "128GB"] },
                battery: { capacity: "2750 mAh", tech: "Li-Ion", charging: "10W", port: "Lightning" },
                features: ["3D Touch", "Live Photos"],
                jailbreak_info: { type: "check_os_based", is_checkm8: true }
            },
            "iphone_6s": {
                name: "iPhone 6s",
                release_date: "25/09/2015",
                default_ios: "iOS 9.0",
                chip_model: "A9",
                display: { size: "4.7 inch", resolution: "1334 x 750", tech: "LCD", refresh_rate: "60Hz" },
                hardware: { cpu: "A9", gpu: "6-core", ram: "2GB", storage_options: ["16GB", "64GB", "128GB"] },
                battery: { capacity: "1715 mAh", tech: "Li-Ion", charging: "10W", port: "Lightning" },
                features: ["3D Touch", "Live Photos"],
                jailbreak_info: { type: "check_os_based", is_checkm8: true }
            },

            // --- SERIES 6 (2014) ---
            "iphone_6_plus": {
                name: "iPhone 6 Plus",
                release_date: "19/09/2014",
                default_ios: "iOS 8.0",
                chip_model: "A8",
                display: { size: "5.5 inch", resolution: "1920 x 1080", tech: "LCD", refresh_rate: "60Hz" },
                hardware: { cpu: "A8", gpu: "4-core", ram: "1GB", storage_options: ["16GB", "64GB", "128GB"] },
                battery: { capacity: "2915 mAh", tech: "Li-Po", charging: "10W", port: "Lightning" },
                features: ["Large Display", "OIS"],
                jailbreak_info: { type: "check_os_based", is_checkm8: true }
            },
            "iphone_6": {
                name: "iPhone 6",
                release_date: "19/09/2014",
                default_ios: "iOS 8.0",
                chip_model: "A8",
                display: { size: "4.7 inch", resolution: "1334 x 750", tech: "LCD", refresh_rate: "60Hz" },
                hardware: { cpu: "A8", gpu: "4-core", ram: "1GB", storage_options: ["16GB", "64GB", "128GB"] },
                battery: { capacity: "1810 mAh", tech: "Li-Po", charging: "10W", port: "Lightning" },
                features: ["New Design", "NFC"],
                jailbreak_info: { type: "check_os_based", is_checkm8: true }
            },

            // --- SERIES 5 (2012-2013) ---
            "iphone_5s": {
                name: "iPhone 5s",
                release_date: "20/09/2013",
                default_ios: "iOS 7.0",
                chip_model: "A7",
                display: { size: "4.0 inch", resolution: "1136 x 640", tech: "LCD", refresh_rate: "60Hz" },
                hardware: { cpu: "A7", gpu: "4-core", ram: "1GB", storage_options: ["16GB", "32GB", "64GB"] },
                battery: { capacity: "1560 mAh", tech: "Li-Po", charging: "5W", port: "Lightning" },
                features: ["TouchID", "64-bit"],
                jailbreak_info: { type: "check_os_based", is_checkm8: true }
            },
            "iphone_5c": {
                name: "iPhone 5c",
                release_date: "20/09/2013",
                default_ios: "iOS 7.0",
                chip_model: "A6",
                display: { size: "4.0 inch", resolution: "1136 x 640", tech: "LCD", refresh_rate: "60Hz" },
                hardware: { cpu: "A6", gpu: "3-core", ram: "1GB", storage_options: ["8GB", "16GB", "32GB"] },
                battery: { capacity: "1510 mAh", tech: "Li-Po", charging: "5W", port: "Lightning" },
                features: ["Plastic Shell", "Colors"],
                jailbreak_info: { type: "check_os_based" }
            },
            "iphone_5": {
                name: "iPhone 5",
                release_date: "21/09/2012",
                default_ios: "iOS 6.0",
                chip_model: "A6",
                display: { size: "4.0 inch", resolution: "1136 x 640", tech: "LCD", refresh_rate: "60Hz" },
                hardware: { cpu: "A6", gpu: "3-core", ram: "1GB", storage_options: ["16GB", "32GB", "64GB"] },
                battery: { capacity: "1440 mAh", tech: "Li-Po", charging: "5W", port: "Lightning" },
                features: ["Lightning Port", "4-inch Screen"],
                jailbreak_info: { type: "check_os_based" }
            }
        };
