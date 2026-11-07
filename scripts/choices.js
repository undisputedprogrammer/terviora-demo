'use strict';
// Custom choices with optional filtering inside the popup.
(() => {
  let opened = null;
  class TervioraChoice extends HTMLElement {
    connectedCallback() {
      if (this.button) return;
      this.items = JSON.parse(this.dataset.options || '[]').map(([value, label]) => ({value, label}));
      this.defaultValue = this.getAttribute('value') ?? this.items[0]?.value ?? '';
      this.currentValue = this.defaultValue;
      this.button = document.createElement('button');
      this.button.type = 'button';
      this.button.className = 'choice-trigger';
      this.button.id = `${this.id}-trigger`;
      this.button.setAttribute('role', 'combobox');
      this.button.setAttribute('aria-label', this.getAttribute('aria-label') || this.id);
      this.button.setAttribute('aria-haspopup', 'listbox');
      this.button.setAttribute('aria-expanded', 'false');
      this.button.setAttribute('aria-controls', `${this.id}-choices-listbox`);
      if (this.hasAttribute('required')) this.button.setAttribute('aria-required', 'true');
      this.caption = document.createElement('span');
      this.caption.className = 'choice-value';
      const chevron = document.createElement('span');
      chevron.className = 'choice-chevron';
      chevron.setAttribute('aria-hidden', 'true');
      this.button.append(this.caption, chevron);
      this.menu = document.createElement('div');
      this.menu.className = 'choice-menu glass-medium';
      this.menu.setAttribute('popover', 'manual');
      this.menu.hidden = true;
      this.list = this.menu;
      if (this.hasAttribute('data-searchable')) this.addSearch();
      this.list.id = `${this.id}-choices-listbox`;
      this.list.setAttribute('role', 'listbox');
      this.list.setAttribute('aria-label', this.button.getAttribute('aria-label'));
      this.input = document.createElement('input');
      this.input.type = 'hidden';
      this.input.name = this.getAttribute('name') || this.id;
      this.error = document.createElement('span');
      this.error.id = `${this.id}-error`;
      this.error.className = 'choice-error';
      this.error.setAttribute('role', 'alert');
      this.error.hidden = true;
      this.append(this.button, this.menu, this.input, this.error);
      this.renderOptions();
      this.button.addEventListener('click', () => opened === this ? this.close() : this.open());
      this.button.addEventListener('keydown', event => this.onKey(event));
      this.menu.addEventListener('pointerdown', event => {
        if (event.target.closest('[role=option]')) event.preventDefault();
      });
      this.menu.addEventListener('click', event => {
        const option = event.target.closest('[role=option]');
        if (option) {
          event.preventDefault();
          this.commit(Number(option.dataset.index));
        }
      });
      this.menu.addEventListener('pointermove', event => {
        const option = event.target.closest('[role=option]');
        if (option) this.highlight(Number(option.dataset.index), false);
      });
      this.closest('form')?.addEventListener('reset', () => {this.value = this.defaultValue; this.close();});
    }
    addSearch() {
      this.searchField = document.createElement('input');
      this.searchField.type = 'search';
      this.searchField.className = 'choice-search glass-input';
      this.searchField.placeholder = 'Search cities';
      this.searchField.autocomplete = 'off';
      this.searchField.setAttribute('aria-label', 'Search cities');
      this.searchField.setAttribute('aria-controls', `${this.id}-choices-listbox`);
      this.list = document.createElement('div');
      this.list.className = 'choice-filtered-list';
      this.noMatches = document.createElement('p');
      this.noMatches.className = 'choice-no-matches';
      this.noMatches.setAttribute('role', 'status');
      this.noMatches.textContent = 'No cities match.';
      this.noMatches.hidden = true;
      this.menu.append(this.searchField, this.list, this.noMatches);
      this.searchField.addEventListener('input', () => this.filterOptions());
      this.searchField.addEventListener('keydown', event => this.onSearchKey(event));
    }
    get visibleOptions() {
      return [...this.list.children].filter(option => !option.hidden);
    }
    filterOptions() {
      const query = this.searchField.value.trim().toLocaleLowerCase();
      [...this.list.children].forEach((option, index) => {
        option.hidden = !this.items[index].label.toLocaleLowerCase().includes(query);
      });
      const options = this.visibleOptions;
      this.noMatches.hidden = options.length > 0;
      const selected = !query && options.find(option => this.items[option.dataset.index].value === this.value);
      this.position();
      this.highlight(Number((selected || options[0])?.dataset.index ?? -1));
    }
    onSearchKey(event) {
      if (event.key === 'Tab' || event.key === 'Escape') {
        this.close();
        this.focus({preventScroll: true});
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
        }
        return;
      }
      if (event.key === 'Enter' && !event.isComposing) {
        event.preventDefault();
        if (this.activeIndex >= 0) this.commit(this.activeIndex);
        return;
      }
      if (!['ArrowDown', 'ArrowUp'].includes(event.key) && !(!this.searchField.value && ['Home', 'End'].includes(event.key))) return;
      event.preventDefault();
      const options = this.visibleOptions;
      const current = options.findIndex(option => Number(option.dataset.index) === this.activeIndex);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1
        : Math.max(0, Math.min(options.length - 1, current + (event.key === 'ArrowDown' ? 1 : -1)));
      if (options[next]) this.highlight(Number(options[next].dataset.index));
    }
    get value() {return this.currentValue || '';}
    set value(value) {
      this.currentValue = this.items?.some(item => item.value === String(value)) ? String(value) : this.items?.[0]?.value || '';
      this.sync();
    }
    get options() {return this.items;}
    setOptions(items) {
      this.close();
      this.items = items;
      if (!items.some(item => item.value === this.value)) this.currentValue = items[0]?.value || '';
      this.defaultValue = items[0]?.value || '';
      this.renderOptions();
    }
    renderOptions() {
      this.list.replaceChildren(...this.items.map((item, index) => {
        const option = document.createElement('div');
        option.className = 'choice-option';
        option.id = `${this.id}-option-${index}`;
        option.dataset.index = index;
        option.setAttribute('role', 'option');
        option.textContent = item.label;
        const check = document.createElement('span');
        check.className = 'choice-check';
        check.setAttribute('aria-hidden', 'true');
        check.textContent = '✓';
        option.append(check);
        return option;
      }));
      this.sync();
    }
    sync() {
      if (!this.button) return;
      this.caption.textContent = this.items.find(item => item.value === this.value)?.label || '';
      this.input.value = this.value;
      [...this.list.children].forEach((option, index) => option.setAttribute('aria-selected', String(this.items[index].value === this.value)));
      if (this.value || !this.hasAttribute('required')) {
        this.button.removeAttribute('aria-invalid');
        this.button.removeAttribute('aria-describedby');
        this.error.hidden = true;
      }
    }
    focus(options) {this.button.focus(options);}
    reportValidity() {
      if (!this.hasAttribute('required') || this.value) return true;
      this.error.textContent = 'Please choose an option.';
      this.error.hidden = false;
      this.button.setAttribute('aria-invalid', 'true');
      this.button.setAttribute('aria-describedby', this.error.id);
      this.focus();
      this.open();
      return false;
    }
    position() {
      const rect = this.button.getBoundingClientRect();
      const style = getComputedStyle(this);
      const gap = parseFloat(style.getPropertyValue('--s2'));
      const maxHeight = parseFloat(style.getPropertyValue('--choice-max-height'));
      const minWidth = parseFloat(style.getPropertyValue('--choice-min-width'));
      const viewport = window.visualViewport;
      const height = viewport?.height || innerHeight;
      const width = viewport?.width || innerWidth;
      const originY = viewport?.offsetTop || 0;
      const originX = viewport?.offsetLeft || 0;
      const below = height + originY - Math.max(rect.bottom, originY) - gap * 2;
      const above = Math.min(rect.top, originY + height) - originY - gap * 2;
      const contentHeight = this.menu.scrollHeight + (this.searchField ? Math.max(0, this.list.scrollHeight - this.list.clientHeight) : 0);
      const up = below < Math.min(maxHeight, contentHeight) && above > below;
      const available = Math.max(gap, Math.min(maxHeight, up ? above : below));
      const menuHeight = Math.min(contentHeight, available);
      const top = up ? rect.top - menuHeight - gap : rect.bottom + gap;
      const menuWidth = Math.min(Math.max(rect.width, minWidth), width - gap * 2);
      this.menu.style.setProperty('--choice-width', `${menuWidth}px`);
      this.menu.style.setProperty('--choice-height', `${available}px`);
      this.menu.style.setProperty('--choice-left', `${Math.max(originX + gap, Math.min(rect.left, originX + width - menuWidth - gap))}px`);
      this.menu.style.setProperty('--choice-top', `${Math.max(originY + gap, Math.min(top, originY + height - menuHeight - gap))}px`);
    }
    open() {
      if (!this.items.length) return;
      opened?.close();
      opened = this;
      this.menu.hidden = false;
      this.menu.showPopover?.();
      this.button.setAttribute('aria-expanded', 'true');
      if (this.searchField) {
        this.searchField.value = '';
        this.filterOptions();
        this.searchField.focus({preventScroll: true});
        return;
      }
      this.position();
      this.highlight(Math.max(0, this.items.findIndex(item => item.value === this.value)));
    }
    close() {
      if (opened !== this) return;
      this.menu.hidePopover?.();
      this.menu.hidden = true;
      this.button.setAttribute('aria-expanded', 'false');
      this.button.removeAttribute('aria-activedescendant');
      this.searchField?.removeAttribute('aria-activedescendant');
      this.typeahead = '';
      opened = null;
    }
    highlight(index, scroll = true) {
      this.activeIndex = index < 0 && this.searchField ? -1 : Math.max(0, Math.min(index, this.items.length - 1));
      [...this.list.children].forEach((option, i) => option.classList.toggle('is-active', i === this.activeIndex));
      const option = this.list.children[this.activeIndex];
      const focusTarget = this.searchField || this.button;
      if (!option) {
        focusTarget.removeAttribute('aria-activedescendant');
        return;
      }
      focusTarget.setAttribute('aria-activedescendant', option.id);
      if (scroll) option.scrollIntoView({block:'nearest', behavior:'instant'});
    }
    commit(index) {
      const old = this.value;
      this.value = this.items[index].value;
      this.close();
      this.focus({preventScroll:true});
      if (old !== this.value) this.dispatchEvent(new Event('change', {bubbles:true}));
    }
    onKey(event) {
      const isOpen = opened === this;
      if (event.key === 'Tab') {this.close(); return;}
      if (event.key === 'Escape' && isOpen) {event.preventDefault(); event.stopPropagation(); this.close(); return;}
      if (['Enter', ' '].includes(event.key)) {
        event.preventDefault();
        isOpen ? this.commit(this.activeIndex) : this.open();
        return;
      }
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        if (!isOpen) this.open();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? this.items.length - 1 : this.activeIndex + (event.key === 'ArrowDown' ? 1 : -1);
        this.highlight(next);
        return;
      }
      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        if (!isOpen) this.open();
        if (this.searchField) {
          this.searchField.value = event.key;
          this.filterOptions();
          return;
        }
        clearTimeout(this.typingTimer);
        this.typeahead = (this.typeahead || '') + event.key.toLocaleLowerCase();
        const index = this.items.findIndex(item => item.label.toLocaleLowerCase().startsWith(this.typeahead));
        if (index >= 0) this.highlight(index);
        this.typingTimer = setTimeout(() => {this.typeahead = '';}, 700);
      }
    }
  }
  customElements.define('terviora-choice', TervioraChoice);
  document.addEventListener('pointerdown', event => {if (opened && !opened.contains(event.target)) opened.close();}, true);
  document.addEventListener('focusin', event => {if (opened && !opened.contains(event.target)) opened.close();});
  document.addEventListener('click', event => {if (opened && event.target.closest('[data-tab],#filter-toggle')) opened.close();});
  window.addEventListener('resize', () => opened?.position());
  window.addEventListener('scroll', event => {if (opened && !opened.menu.contains(event.target)) opened.position();}, true);
  window.visualViewport?.addEventListener('resize', () => opened?.position());
})();
