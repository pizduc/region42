
import * as React from "react";

// Common device breakpoints
export const MOBILE_BREAKPOINT = 768;      // Standard mobile breakpoint
export const TABLET_BREAKPOINT = 1024;     // Standard tablet breakpoint
export const LAPTOP_BREAKPOINT = 1440;     // Standard laptop breakpoint

// Extensive smartphone diagonals in inches
export const SMARTPHONE_DIAGONALS = [
  // iPhones
  { size: 3.5, description: "iPhone 4/4S" },
  { size: 4.0, description: "iPhone 5/5s/5c/SE (1st gen)" },
  { size: 4.7, description: "iPhone 6/6s/7/8/SE (2nd/3rd gen)" },
  { size: 5.4, description: "iPhone 12 mini/13 mini" },
  { size: 5.5, description: "iPhone 6 Plus/6s Plus/7 Plus/8 Plus" },
  { size: 5.8, description: "iPhone X/XS/11 Pro" },
  { size: 6.1, description: "iPhone XR/11/12/13/14/15" },
  { size: 6.5, description: "iPhone XS Max/11 Pro Max" },
  { size: 6.7, description: "iPhone 12 Pro Max/13 Pro Max/14 Plus/14 Pro Max/15 Plus/15 Pro Max" },
  
  // Samsung Galaxy S series
  { size: 5.0, description: "Samsung Galaxy S4/S5" },
  { size: 5.1, description: "Samsung Galaxy S6/S7" },
  { size: 5.5, description: "Samsung Galaxy S7 Edge" },
  { size: 5.8, description: "Samsung Galaxy S8/S9" },
  { size: 6.1, description: "Samsung Galaxy S10/S20/S21" },
  { size: 6.2, description: "Samsung Galaxy S8+/S9+" },
  { size: 6.4, description: "Samsung Galaxy S10+/S20 FE/S21 FE" },
  { size: 6.5, description: "Samsung Galaxy S22" },
  { size: 6.6, description: "Samsung Galaxy S23" },
  { size: 6.7, description: "Samsung Galaxy S10 5G/S20+/S21+/S22+/S23+" },
  { size: 6.8, description: "Samsung Galaxy S21 Ultra/S22 Ultra/S23 Ultra/S24 Ultra" },
  { size: 6.9, description: "Samsung Galaxy S20 Ultra" },
  
  // Samsung Galaxy Note series
  { size: 5.3, description: "Samsung Galaxy Note" },
  { size: 5.5, description: "Samsung Galaxy Note 2" },
  { size: 5.7, description: "Samsung Galaxy Note 3/4/5" },
  { size: 6.3, description: "Samsung Galaxy Note 8" },
  { size: 6.4, description: "Samsung Galaxy Note 9" },
  { size: 6.8, description: "Samsung Galaxy Note 10+/20/20 Ultra" },
  
  // Samsung Galaxy Fold/Flip series
  { size: 6.7, description: "Samsung Galaxy Z Flip/Z Flip 2/Z Flip 3/Z Flip 4/Z Flip 5" },
  { size: 7.3, description: "Samsung Galaxy Fold" },
  { size: 7.6, description: "Samsung Galaxy Z Fold 2/Z Fold 3/Z Fold 4/Z Fold 5" },
  
  // Google Pixel
  { size: 5.0, description: "Google Pixel/Pixel XL" },
  { size: 5.5, description: "Google Pixel 3" },
  { size: 5.7, description: "Google Pixel 4" },
  { size: 5.8, description: "Google Pixel 4a" },
  { size: 6.0, description: "Google Pixel 2/2 XL/3 XL/5" },
  { size: 6.1, description: "Google Pixel 5a/6a" },
  { size: 6.3, description: "Google Pixel 4 XL/6/7a" },
  { size: 6.4, description: "Google Pixel 6 Pro/7" },
  { size: 6.7, description: "Google Pixel 7 Pro/8/8 Pro" },
  
  // OnePlus
  { size: 5.5, description: "OnePlus 1/2/3/3T" },
  { size: 6.0, description: "OnePlus 5/5T" },
  { size: 6.3, description: "OnePlus 6/6T" },
  { size: 6.4, description: "OnePlus 7/7T" },
  { size: 6.5, description: "OnePlus 8/8T/9R" },
  { size: 6.7, description: "OnePlus 7 Pro/7T Pro/8 Pro/9/9 Pro/10 Pro/11" },
  
  // Xiaomi
  { size: 6.3, description: "Xiaomi Mi 9/Mi 10 Lite" },
  { size: 6.4, description: "Xiaomi POCO F1/F2/F3" },
  { size: 6.5, description: "Xiaomi Mi 10T/Mi 11 Lite" },
  { size: 6.7, description: "Xiaomi Mi 10/Mi 10 Pro/Mi 10T Pro" },
  { size: 6.8, description: "Xiaomi Mi 11/12/12 Pro" },
  
  // Huawei
  { size: 6.1, description: "Huawei P20/P30" },
  { size: 6.4, description: "Huawei P30 Pro" },
  { size: 6.5, description: "Huawei P40/P50" },
  { size: 6.6, description: "Huawei Mate 30" },
  { size: 6.8, description: "Huawei P40 Pro/P50 Pro/Mate 40 Pro" },
  
  // Sony Xperia
  { size: 5.0, description: "Sony Xperia Z1/Z2/Z3" },
  { size: 5.2, description: "Sony Xperia Z3+/Z5/XZ" },
  { size: 6.0, description: "Sony Xperia XZ2/XZ3" },
  { size: 6.1, description: "Sony Xperia 1/5" },
  { size: 6.5, description: "Sony Xperia 1 II/1 III/1 IV/5 II/5 III/5 IV" },
  
  // LG
  { size: 5.3, description: "LG G5" },
  { size: 5.7, description: "LG G6/V20" },
  { size: 6.1, description: "LG G7/G8" },
  { size: 6.4, description: "LG V30/V40/V50/G8X/Velvet" },
  
  // Motorola
  { size: 5.7, description: "Motorola Moto G5 Plus" },
  { size: 6.2, description: "Motorola Moto G7/Edge" },
  { size: 6.4, description: "Motorola Moto G8/G9/G50/G60" },
  { size: 6.7, description: "Motorola Edge+/Edge 30" },
  
  // Nokia
  { size: 5.5, description: "Nokia 6/7/8" },
  { size: 6.0, description: "Nokia 7 Plus" },
  { size: 6.3, description: "Nokia 8 Sirocco/9 PureView" },
  { size: 6.5, description: "Nokia XR20" },
  
  // ASUS
  { size: 6.0, description: "ASUS ZenFone 5" },
  { size: 6.4, description: "ASUS ZenFone 6/7" },
  { size: 6.8, description: "ASUS ROG Phone 3/5/6" },
  { size: 7.1, description: "ASUS ROG Phone 2" },
  
  // Other popular models
  { size: 6.3, description: "Nothing Phone (1)" },
  { size: 6.6, description: "Nothing Phone (2)" },
  { size: 6.7, description: "OPPO Find X3/X5 Pro" },
  { size: 6.8, description: "Xiaomi Redmi Note 10/11/12 Pro" },
];

// Extensive tablet diagonals in inches
export const TABLET_DIAGONALS = [
  // iPad
  { size: 7.9, description: "iPad Mini (1st/2nd/3rd/4th gen)" },
  { size: 8.3, description: "iPad Mini (6th gen)" },
  { size: 9.7, description: "iPad (1st/2nd/3rd/4th/5th/6th gen)/iPad Air (1st/2nd gen)/iPad Pro (1st gen)" },
  { size: 10.2, description: "iPad (7th/8th/9th/10th gen)" },
  { size: 10.5, description: "iPad Pro (2nd gen)/iPad Air (3rd gen)" },
  { size: 10.9, description: "iPad Air (4th/5th gen)/iPad (10th gen)" },
  { size: 11.0, description: "iPad Pro 11-inch (1st/2nd/3rd/4th gen)" },
  { size: 12.9, description: "iPad Pro 12.9-inch (1st/2nd/3rd/4th/5th/6th gen)" },
  
  // Samsung Galaxy Tab
  { size: 7.0, description: "Samsung Galaxy Tab A7 Lite" },
  { size: 8.0, description: "Samsung Galaxy Tab A/S2/S3" },
  { size: 8.4, description: "Samsung Galaxy Tab S5e" },
  { size: 8.7, description: "Samsung Galaxy Tab A7" },
  { size: 9.7, description: "Samsung Galaxy Tab S2/S3" },
  { size: 10.1, description: "Samsung Galaxy Tab A/2/3/4" },
  { size: 10.4, description: "Samsung Galaxy Tab S6 Lite/S7 FE" },
  { size: 10.5, description: "Samsung Galaxy Tab S/S4/S5e/S6/S7/S8" },
  { size: 11.0, description: "Samsung Galaxy Tab S7/S8" },
  { size: 12.4, description: "Samsung Galaxy Tab S7+/S8+" },
  { size: 14.6, description: "Samsung Galaxy Tab S8 Ultra" },
  
  // Amazon Fire Tablets
  { size: 7.0, description: "Amazon Fire 7" },
  { size: 8.0, description: "Amazon Fire HD 8" },
  { size: 10.1, description: "Amazon Fire HD 10" },
  
  // Huawei Tablets
  { size: 8.4, description: "Huawei MediaPad M5" },
  { size: 10.1, description: "Huawei MediaPad M5/MatePad Pro" },
  { size: 10.8, description: "Huawei MatePad Pro" },
  { size: 12.6, description: "Huawei MatePad Pro" },
  
  // Lenovo Tablets
  { size: 8.0, description: "Lenovo Tab M8" },
  { size: 10.1, description: "Lenovo Tab M10/P11" },
  { size: 10.3, description: "Lenovo Tab M10 Plus" },
  { size: 11.5, description: "Lenovo Tab P11 Pro" },
  { size: 12.6, description: "Lenovo Tab P12 Pro" },
  
  // Microsoft Surface
  { size: 10.6, description: "Microsoft Surface RT/Surface 2" },
  { size: 10.8, description: "Microsoft Surface Go/Go 2/Go 3" },
  { size: 12.0, description: "Microsoft Surface Pro/Pro 2" },
  { size: 12.3, description: "Microsoft Surface Pro 3/4/5/6/7/8" },
  { size: 13.0, description: "Microsoft Surface Pro X" },
  { size: 13.5, description: "Microsoft Surface Book/Surface Laptop" },
  { size: 15.0, description: "Microsoft Surface Book/Surface Laptop" },
  
  // Xiaomi/Other Chinese Tablets
  { size: 10.1, description: "Xiaomi Mi Pad 4 Plus" },
  { size: 11.0, description: "Xiaomi Pad 5/5 Pro" },
  { size: 12.4, description: "Xiaomi Pad 6 Pro" },
  
  // ASUS Tablets
  { size: 8.0, description: "ASUS ZenPad 8" },
  { size: 10.1, description: "ASUS ZenPad 10" },
  
  // Google Pixel Tablet
  { size: 11.0, description: "Google Pixel Tablet" },
  
  // OnePlus Tablet
  { size: 11.6, description: "OnePlus Pad" },
];

// More precise calculation of device physical size
export function calculateDevicePhysicalSizeInInches() {
  try {
    // Get device pixel ratio
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Get screen width and height in CSS pixels
    const widthInCssPixels = window.screen.width;
    const heightInCssPixels = window.screen.height;
    
    // Convert to physical pixels
    const widthInPhysicalPixels = widthInCssPixels * devicePixelRatio;
    const heightInPhysicalPixels = heightInCssPixels * devicePixelRatio;
    
    // Standard pixel density (PPI) for common devices
    // This is an approximation as browsers don't expose the actual PPI
    let ppi = 96; // Default PPI for most desktop displays
    
    if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
      ppi = 264; // Approximate PPI for iOS devices
    } else if (navigator.userAgent.match(/Android/i)) {
      ppi = 160; // Base density for Android devices
      
      if (devicePixelRatio >= 3) {
        ppi = 450; // High-end Android devices
      } else if (devicePixelRatio >= 2) {
        ppi = 320; // Mid-range Android devices
      }
    }
    
    // Calculate physical dimensions in inches
    const widthInInches = widthInPhysicalPixels / ppi;
    const heightInInches = heightInPhysicalPixels / ppi;
    
    // Calculate diagonal using Pythagorean theorem
    const diagonalInInches = Math.sqrt(
      Math.pow(widthInInches, 2) + Math.pow(heightInInches, 2)
    );
    
    return parseFloat(diagonalInInches.toFixed(1));
  } catch (error) {
    console.error("Error calculating device size:", error);
    return null; // Return null if calculation fails
  }
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const detectMobile = () => {
      // Проверяем ширину экрана
      const byWidth = window.innerWidth < MOBILE_BREAKPOINT;
      
      // Проверяем user agent на мобильные устройства
      const byUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      
      // Проверяем конкретно на iPhone
      const isIphone = /iPhone/i.test(navigator.userAgent);
      
      // Определяем ориентацию устройства
      const isPortrait = window.innerHeight > window.innerWidth;
      
      // Для iPhone всегда считаем мобильным устройством
      if (isIphone) {
        setIsMobile(true);
        return;
      }
      
      // Для других устройств объединяем проверки
      setIsMobile(isPortrait ? (byWidth || byUserAgent) : byWidth);
    };
    
    // Слушаем изменения в видимой области
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    mql.addEventListener("change", detectMobile);
    
    // Слушаем изменения ориентации
    window.addEventListener("orientationchange", detectMobile);
    window.addEventListener("resize", detectMobile);
    
    // Начальная проверка
    detectMobile();
    
    return () => {
      mql.removeEventListener("change", detectMobile);
      window.removeEventListener("orientationchange", detectMobile);
      window.removeEventListener("resize", detectMobile);
    };
  }, []);

  return !!isMobile;
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const detectTablet = () => {
      // Используем размер экрана для базового определения
      const byWidth = window.innerWidth >= MOBILE_BREAKPOINT && 
                      window.innerWidth < TABLET_BREAKPOINT;
      
      // Используем ориентацию и user agent как дополнительные сигналы
      const isTabletOrientation = window.innerHeight < window.innerWidth;
      const isTabletUserAgent = /iPad|Android(?!.*Mobile)|Tablet/i.test(navigator.userAgent);
      
      // В портретной ориентации приоритет даём ширине и user agent
      const isPortrait = window.innerHeight > window.innerWidth;
      
      // Комбинируем проверки с приоритетом на определение по ширине
      if (isPortrait) {
        // В портретном режиме также учитываем соотношение сторон для более точного определения
        const aspectRatio = window.innerWidth / window.innerHeight;
        const isTabletAspectRatio = aspectRatio > 0.5 && aspectRatio < 0.85;
        
        setIsTablet(byWidth || (isTabletAspectRatio && isTabletUserAgent));
      } else {
        setIsTablet(byWidth || (isTabletOrientation && isTabletUserAgent));
      }
    };
    
    const mql = window.matchMedia(
      `(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${TABLET_BREAKPOINT - 1}px)`
    );
    mql.addEventListener("change", detectTablet);
    
    // Добавляем прослушивание изменения ориентации экрана
    window.addEventListener("orientationchange", detectTablet);
    window.addEventListener("resize", detectTablet);
    
    detectTablet(); // Initial check
    
    return () => {
      mql.removeEventListener("change", detectTablet);
      window.removeEventListener("orientationchange", detectTablet);
      window.removeEventListener("resize", detectTablet);
    };
  }, []);

  return !!isTablet;
}

export function useDeviceSize() {
  const [deviceSize, setDeviceSize] = React.useState<'mobile' | 'tablet' | 'laptop' | 'desktop'>('desktop');
  const [deviceDiagonal, setDeviceDiagonal] = React.useState<number | null>(null);
  const [detectedDevice, setDetectedDevice] = React.useState<string | null>(null);

  React.useEffect(() => {
    const updateDeviceInfo = () => {
      // Обновляем категорию размера устройства на основе ширины и ориентации
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isPortrait = height > width;
      
      let newDeviceSize: 'mobile' | 'tablet' | 'laptop' | 'desktop' = 'desktop';
      
      // В портретной ориентации используем более агрессивное определение мобильных устройств
      if (isPortrait) {
        const aspectRatio = width / height;
        
        if (width < MOBILE_BREAKPOINT || aspectRatio < 0.65) {
          newDeviceSize = 'mobile';
        } else if (width < TABLET_BREAKPOINT || (aspectRatio >= 0.65 && aspectRatio < 0.85)) {
          newDeviceSize = 'tablet';
        } else if (width < LAPTOP_BREAKPOINT) {
          newDeviceSize = 'laptop';
        }
      } else {
        // В альбомной ориентации использовать стандартные брейкпоинты
        if (width < MOBILE_BREAKPOINT) {
          newDeviceSize = 'mobile';
        } else if (width < TABLET_BREAKPOINT) {
          newDeviceSize = 'tablet';
        } else if (width < LAPTOP_BREAKPOINT) {
          newDeviceSize = 'laptop';
        }
      }
      
      setDeviceSize(newDeviceSize);
      
      // Пытаемся определить диагональ устройства
      const diagonalSize = calculateDevicePhysicalSizeInInches();
      setDeviceDiagonal(diagonalSize);
      
      // Сопоставляем с известным устройством, если возможно
      if (diagonalSize) {
        // Выбираем подходящий список устройств в зависимости от типа устройства
        const deviceList = newDeviceSize === 'mobile' || newDeviceSize === 'tablet' 
          ? [...SMARTPHONE_DIAGONALS, ...TABLET_DIAGONALS]
          : [];
          
        // Находим ближайшее соответствие по размеру диагонали
        if (deviceList.length > 0) {
          const closestDevice = deviceList.reduce((prev, curr) => {
            return Math.abs(curr.size - diagonalSize) < Math.abs(prev.size - diagonalSize)
              ? curr
              : prev;
          });
          
          // Если мы нашли достаточно близкое соответствие
          if (Math.abs(closestDevice.size - diagonalSize) < 0.5) {
            setDetectedDevice(closestDevice.description);
          } else {
            setDetectedDevice(`Unknown ${newDeviceSize} device (${diagonalSize}")`);
          }
        } else {
          setDetectedDevice(`${newDeviceSize} device (${diagonalSize}")`);
        }
      } else {
        setDetectedDevice(null);
      }
    };

    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);
    updateDeviceInfo(); // Initial check
    
    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  return { 
    deviceSize, 
    deviceDiagonal, 
    detectedDevice 
  };
}

// Хук для получения соотношения сторон устройства
export function useDeviceAspectRatio() {
  const [aspectRatio, setAspectRatio] = React.useState<number | null>(null);
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait');

  React.useEffect(() => {
    const updateAspectRatio = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      const ratio = width / height;
      setAspectRatio(parseFloat(ratio.toFixed(2)));
      
      setOrientation(width > height ? 'landscape' : 'portrait');
    };
    
    window.addEventListener('resize', updateAspectRatio);
    window.addEventListener('orientationchange', updateAspectRatio);
    updateAspectRatio(); // Initial check
    
    return () => {
      window.removeEventListener('resize', updateAspectRatio);
      window.removeEventListener('orientationchange', updateAspectRatio);
    };
  }, []);

  return { aspectRatio, orientation };
}

// Хук для получения детальной информации о состоянии отзывчивости
export function useResponsiveInfo() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const { deviceSize, deviceDiagonal, detectedDevice } = useDeviceSize();
  const { aspectRatio, orientation } = useDeviceAspectRatio();

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    deviceSize,
    deviceDiagonal,
    detectedDevice,
    aspectRatio,
    orientation,
    viewportWidth: typeof window !== 'undefined' ? window.innerWidth : null,
    viewportHeight: typeof window !== 'undefined' ? window.innerHeight : null,
    devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : null,
  };
}
