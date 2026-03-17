document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menuBtn');
  const navMenu = document.getElementById('navMenu');

  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => navMenu.classList.toggle('open'));
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navMenu.classList.remove('open'));
    });
  }

  const revealItems = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach(item => observer.observe(item));

  const cards = document.querySelectorAll('.zikr-card');
  if (cards.length) {
    const progressFill = document.querySelector('.progress-fill');
    const completedEl = document.querySelector('[data-completed]');
    const totalEl = document.querySelector('[data-total]');
    const percentEl = document.querySelector('[data-percent]');
    const resetBtn = document.querySelector('[data-reset]');
    const storageKey = document.body.dataset.page || 'azkar-page';

    const state = JSON.parse(localStorage.getItem(storageKey) || '{}');

    const saveState = () => {
      const out = {};
      cards.forEach((card, index) => {
        const countEl = card.querySelector('.counter-value');
        const done = card.classList.contains('done');
        out[index] = { count: Number(countEl.textContent), done };
      });
      localStorage.setItem(storageKey, JSON.stringify(out));
    };

    const updateProgress = () => {
      const total = cards.length;
      const completed = [...cards].filter(card => card.classList.contains('done')).length;
      const percent = total ? Math.round((completed / total) * 100) : 0;

      if (progressFill) progressFill.style.width = `${percent}%`;
      if (completedEl) completedEl.textContent = completed;
      if (totalEl) totalEl.textContent = total;
      if (percentEl) percentEl.textContent = `${percent}%`;
    };

    cards.forEach((card, index) => {
      const increaseBtn = card.querySelector('[data-plus]');
      const decreaseBtn = card.querySelector('[data-minus]');
      const completeBtn = card.querySelector('[data-complete]');
      const countEl = card.querySelector('.counter-value');
      const target = Number(card.dataset.target || '1');

      if (state[index]) {
        countEl.textContent = state[index].count ?? 0;
        if (state[index].done) card.classList.add('done');
      }

      const syncDone = () => {
        const current = Number(countEl.textContent);
        if (current >= target) {
          card.classList.add('done');
        } else if (!card.dataset.manualDone) {
          card.classList.remove('done');
        }
        updateProgress();
        saveState();
      };

      increaseBtn?.addEventListener('click', () => {
        const current = Number(countEl.textContent);
        countEl.textContent = current + 1;
        card.dataset.manualDone = '';
        syncDone();
      });

      decreaseBtn?.addEventListener('click', () => {
        const current = Number(countEl.textContent);
        countEl.textContent = Math.max(0, current - 1);
        card.dataset.manualDone = '';
        syncDone();
      });

      completeBtn?.addEventListener('click', () => {
        const isDone = card.classList.toggle('done');
        card.dataset.manualDone = isDone ? '1' : '';
        if (isDone && Number(countEl.textContent) < target) {
          countEl.textContent = target;
        }
        if (!isDone && Number(countEl.textContent) >= target) {
          countEl.textContent = Math.max(0, target - 1);
        }
        updateProgress();
        saveState();
      });

      syncDone();
    });

    resetBtn?.addEventListener('click', () => {
      cards.forEach(card => {
        card.classList.remove('done');
        card.dataset.manualDone = '';
        const countEl = card.querySelector('.counter-value');
        if (countEl) countEl.textContent = '0';
      });
      localStorage.removeItem(storageKey);
      updateProgress();
    });

    updateProgress();
  }
});
