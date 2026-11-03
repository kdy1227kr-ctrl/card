/**
 * 김달용 웹 명함 인터랙션 스크립트 (script.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM 요소 선택
  const card = document.getElementById('card');
  const cardContainer = document.querySelector('.card-container');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const emailText = document.getElementById('emailText');
  const saveContactBtn = document.getElementById('saveContactBtn');
  const shareBtn = document.getElementById('shareBtn');
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');

  /* -------------------------------------------------------------
   * 1. 3D 인터랙티브 카드 틸트 (Tilt Effect)
   * ------------------------------------------------------------- */
  if (card && cardContainer) {
    let bounds;

    function updateBounds() {
      bounds = card.getBoundingClientRect();
    }

    function rotateToMouse(e) {
      if (!bounds) updateBounds();

      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const leftX = mouseX - bounds.x;
      const topY = mouseY - bounds.y;
      const center = {
        x: leftX - bounds.width / 2,
        y: topY - bounds.height / 2
      };

      // 기울기 각도 계산 (최대 약 12도)
      const maxDegree = 12;
      const rotateX = (-center.y / (bounds.height / 2)) * maxDegree;
      const rotateY = (center.x / (bounds.width / 2)) * maxDegree;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    }

    cardContainer.addEventListener('mouseenter', () => {
      updateBounds();
      card.style.transition = 'transform 0.1s ease-out';
    });

    cardContainer.addEventListener('mousemove', rotateToMouse);

    cardContainer.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });

    // 윈도우 리사이즈 시 bounds 업데이트
    window.addEventListener('resize', updateBounds);
  }

  /* -------------------------------------------------------------
   * 2. 토스트 알림 헬퍼 함수
   * ------------------------------------------------------------- */
  let toastTimer = null;
  function showToast(message) {
    if (!toast) return;
    toastMsg.textContent = message;
    toast.classList.add('show');

    if (toastTimer) {
      clearTimeout(toastTimer);
    }

    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  /* -------------------------------------------------------------
   * 3. 이메일 클립보드 복사 기능
   * ------------------------------------------------------------- */
  if (copyEmailBtn && emailText) {
    copyEmailBtn.addEventListener('click', async () => {
      const email = emailText.textContent.trim();
      try {
        await navigator.clipboard.writeText(email);
        showToast('이메일 주소가 복사되었습니다! 📋');
      } catch (err) {
        // Fallback 방식
        const textArea = document.createElement('textarea');
        textArea.value = email;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('이메일 주소가 복사되었습니다! 📋');
      }
    });
  }

  /* -------------------------------------------------------------
   * 4. 다크 / 라이트 테마 토글 기능 (localStorage 연동)
   * ------------------------------------------------------------- */
  if (themeToggleBtn) {
    // 저장된 이전 테마 확인
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
      updateThemeIcon(true);
    }

    themeToggleBtn.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light-theme');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
      updateThemeIcon(isLight);
    });

    function updateThemeIcon(isLight) {
      const icon = themeToggleBtn.querySelector('i');
      if (icon) {
        if (isLight) {
          icon.className = 'fa-solid fa-sun';
          icon.style.color = '#f59e0b';
        } else {
          icon.className = 'fa-solid fa-moon';
          icon.style.color = '';
        }
      }
    }
  }

  /* -------------------------------------------------------------
   * 5. 연락처 vCard (.vcf) 다운로드 기능
   * ------------------------------------------------------------- */
  if (saveContactBtn) {
    saveContactBtn.addEventListener('click', () => {
      // vCard 3.0 포맷 생성
      const vcardData = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'N:김;달용;;;',
        'FN:김달용',
        'TITLE:바이브코딩 풀스택 개발자',
        'EMAIL;TYPE=INTERNET,HOME;TYPE=pref:kdy1227kr@gmail.com',
        'NOTE:아이디어를 코드로 실현하며 바이브 넘치는 웹 경험을 만듭니다.',
        'END:VCARD'
      ].join('\r\n');

      const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '김달용_연락처.vcf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('연락처 파일(vCard)이 다운로드되었습니다! 📇');
    });
  }

  /* -------------------------------------------------------------
   * 6. 명함 링크 공유하기 (Web Share API & URL 복사)
   * ------------------------------------------------------------- */
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const shareData = {
        title: '김달용 | 바이브코딩 풀스택 개발자 웹 명함',
        text: '바이브코딩 풀스택 개발자 김달용의 디지털 웹 명함입니다.',
        url: window.location.href
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          // 사용자가 공유 취소한 경우 예외 무시
        }
      } else {
        // Web Share 미지원 브라우저는 URL 복사
        try {
          await navigator.clipboard.writeText(window.location.href);
          showToast('명함 링크가 복사되었습니다! 🔗');
        } catch (e) {
          showToast('명함 링크 복사에 실패했습니다.');
        }
      }
    });
  }
});
