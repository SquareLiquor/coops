import { PUBLIC_KAKAO_MAP_API_KEY } from "$env/static/public";

declare global {
  interface Window {
    kakao: any;
  }
}
export { };

let kakaoMapPromise: Promise<typeof window.kakao> | null = null;

export function loadKakaoMap(): Promise<typeof window.kakao> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Kakao map can only be loaded in the browser.'));
  }

  if (kakaoMapPromise) return kakaoMapPromise;

  kakaoMapPromise = new Promise((resolve, reject) => {
    // 이미 로드된 경우
    if (window.kakao && window.kakao.maps) {
      resolve(window.kakao);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${PUBLIC_KAKAO_MAP_API_KEY}&autoload=false&libraries=services`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (!window.kakao || !window.kakao.maps) {
        reject(new Error('Kakao map SDK loaded, but window.kakao.maps is undefined.'));
        return;
      }

      // SDK 내부 초기화 완료 후 실행
      window.kakao.maps.load(() => {
        resolve(window.kakao);
      });
    };

    script.onerror = () => {
      reject(new Error('Failed to load Kakao map script.'));
    };

    document.head.appendChild(script);
  });

  return kakaoMapPromise;
}
