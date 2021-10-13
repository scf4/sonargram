import { useEffect, useState } from 'react';

const useGetMobilePlatform = () => {
  const [isIos, setIsIos] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    setIsIos(Boolean(navigator?.userAgent.match(/iPhone|iPad|iPod/i)));
    setIsAndroid(Boolean(navigator?.userAgent.match(/Android/i)));
  }, [isIos, isAndroid]);

  return { isIos, isAndroid };
};

export default useGetMobilePlatform;
