'use strict';
(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const {properties, types, groups, galleryAngles} = window.TervioraData;
  const residential = groups.residential;
  const browse = document.body.classList.contains('catalog-page');
  const detailPage = document.body.classList.contains('detail-page');
  const detailRoot = $('#property-detail');
  const sorters = {
    newest: (a, b) => b.posted.localeCompare(a.posted),
    'price-low': (a, b) => a.price - b.price,
    'price-high': (a, b) => b.price - a.price,
    'area-high': (a, b) => b.area - a.area
  };
  let activeTab = 'buy', latestIntent = 'sale', resultMode = 'search', toastTimer, previousQuery = location.search;
  let resettingFilters = false;
  let committedFilters = {};
  const storageKey = 'terviora-shortlist-v1';
  let storageAvailable = true, saved = new Set();
  function loadShortlist() {
    try {
      const data = JSON.parse(localStorage.getItem(storageKey) || '[]');
      saved = new Set(Array.isArray(data) ? data.filter(id => properties.some(p => p.id === id)) : []);
    } catch { storageAvailable = false; }
  }
  loadShortlist();
  const iconPaths = { heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>', bed:'<path d="M3 18V7m18 11V11H3m3 0V7h6v4m0 0V7h6v4M3 16h18"/>', bath:'<path d="M3 12h18l-2 6H5Zm2 0V5a2 2 0 0 1 4 0M6 18v2m12-2v2"/>', area:'<path d="M3 9V3h6m6 0h6v6M3 15v6h6m6 0h6v-6M3 3l6 6m12-6-6 6M3 21l6-6m12 6-6-6"/>' };
  const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${iconPaths[name]}</svg>`;
  const price = p => p.listing_type === 'rent' ? `₹${p.price.toLocaleString('en-IN')} <small>/ month</small>` : p.price >= 10000000 ? `₹${Number((p.price/10000000).toFixed(2))} Cr` : `₹${Number((p.price/100000).toFixed(1))} Lakh`;
  const imgAlt = {'modern-hero':'Modern charcoal Kerala villa with flat cantilevered roof and glass balcony','modern-villa':'Modern white cubist villa in Kerala','modern-house':'Minimal flat-roof home with grey stone and floor-to-ceiling glass','modern-apartment':'Contemporary apartments with deep white balconies and glass balustrades','modern-office':'Minimal concrete and glass office in Kochi','modern-land':'Contemporary residential plot edged by palms and a white wall','modern-interior':'Modern double-height living room with glass walls and a floating stair'};
  const img = (key, cls = '', priority = false, sizes = '(max-width:767px) 90vw, 45vw', alt = imgAlt[key]) => `<img class="${cls}" src="assets/images/${key}-640.webp" srcset="assets/images/${key}-640.webp 640w, assets/images/${key}-1280.webp 1280w" sizes="${sizes}" width="1280" height="853" ${priority ? '' : 'loading="lazy"'} alt="${alt}">`;
  const pendingPhotos = new WeakMap();
  function swapPhoto(container, photo) {
    const current = $('img:not(.motion-photo-out)', container);
    pendingPhotos.set(container, photo);
    const replace = crossfade => {
      if (pendingPhotos.get(container) !== photo) return;
      pendingPhotos.delete(container);
      $('.motion-photo-out', container)?.remove();
      if (current) current.replaceWith(photo);
      else container.append(photo);
      if (!crossfade || reducedMotion.matches || !current.naturalWidth || !container.getClientRects().length) return;

      current.removeAttribute('id');
      current.setAttribute('aria-hidden', 'true');
      current.classList.add('motion-photo-out');
      for (const event of ['animationend', 'animationcancel']) {
        current.addEventListener(event, () => current.remove(), { once: true });
      }
      photo.after(current);
    };

    if (current && photo.decode) {
      photo.decode().then(() => replace(true), () => replace(false));
    } else {
      replace(false);
    }
  }
  const facts = p => `<div class="property-facts">${p.beds ? `<span>${icon('bed')}${p.beds} beds</span><span>${icon('bath')}${p.baths} baths</span>` : `<span>${types[p.property_type]}</span>`}<span>${icon('area')}${p.area.toLocaleString('en-IN')} sq ft</span></div>`;
  const favorite = p => `<button class="favorite glass-light" data-favorite="${p.id}" aria-label="${saved.has(p.id) ? 'Remove' : 'Save'} ${p.title} ${saved.has(p.id) ? 'from' : 'to'} shortlist" aria-pressed="${saved.has(p.id)}">${icon('heart')}</button>`;
  const listingUrl = (values = {}) => {
    const params = new URLSearchParams(Object.entries(values).filter(([, value]) => value));
    return `listings.html${params.size ? `?${params}` : ''}`;
  };
  const returnSearch = detailPage ? new URLSearchParams(location.search).get('search') : '';
  const propertyUrl = id => {
    const params = new URLSearchParams({id});
    const search = browse ? location.search.slice(1) : returnSearch;
    if (search) params.set('search', search);
    return `property.html?${params}`;
  };
  const photo = p => `
    <div class="property-image">
      <a class="property-photo-action" href="${propertyUrl(p.id)}" data-property="${p.id}" aria-label="View ${p.title}">
        ${img(p.image)}
        <span class="property-view glass-light" aria-hidden="true">View details ↗</span>
      </a>
      <span class="property-tag glass-light">${p.listing_type === 'sale' ? 'For sale' : 'For rent'}</span>
      ${favorite(p)}
    </div>`;
  function propertyCard(p, compact = false) {
    const date = new Date(p.posted+'T12:00:00').toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'});
    return `
      <article class="${compact ? 'latest-card' : 'property-card'}">
        ${photo(p)}
        <div class="property-body">
          <div class="property-heading">
            <div class="listing-identity">
              <h3><a class="property-title" href="${propertyUrl(p.id)}" data-property="${p.id}">${p.title}</a></h3>
              <p class="property-location">${p.locality}, ${p.location}</p>
            </div>
            <p class="listing-price">${price(p)}</p>
          </div>
          ${facts(p)}
          ${compact ? `<span class="posted-date">${date}</span>` : ''}
        </div>
      </article>`;
  }
  function renderLatest() {
    const list = properties.filter(p => p.listing_type === latestIntent).sort((a,b)=>b.posted.localeCompare(a.posted)).slice(0,4);
    $('#latest-grid').innerHTML = list.map(p => propertyCard(p,true)).join('');
    $('#latest-announcement').textContent = `${list.length} latest properties ${latestIntent==='sale'?'for sale':'for rent'}.`;
    $$('[data-latest]').forEach(b=>b.setAttribute('aria-pressed', String(b.dataset.latest===latestIntent)));
  }
  function toast(message) { clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').hidden = false; toastTimer = setTimeout(()=>$('#toast').hidden=true, 4000); }
  function syncSaved() {
    $$('[data-saved-count]').forEach(count => { count.textContent = saved.size; });
    $$('[data-favorite]').forEach(b=>{const p=properties.find(p=>p.id===b.dataset.favorite);const selected=saved.has(p.id);b.setAttribute('aria-pressed',String(selected));b.setAttribute('aria-label',`${selected?'Remove':'Save'} ${p.title} ${selected?'from':'to'} shortlist`);});
    $$('[data-save-detail]').forEach(b=>{b.textContent=saved.has(b.dataset.saveDetail)?'Remove from shortlist':'Save to shortlist';b.setAttribute('aria-pressed',String(saved.has(b.dataset.saveDetail)));});
  }
  function toggleSaved(id) {
    if(!properties.some(p=>p.id===id)) return;
    saved.has(id) ? saved.delete(id) : saved.add(id);
    try { localStorage.setItem(storageKey, JSON.stringify([...saved])); } catch { storageAvailable=false; }
    syncSaved();
    toast(`${saved.has(id)?'Added to':'Removed from'} your shortlist.${storageAvailable?'':' Saved for this visit only.'}`);
    if (browse && resultMode === 'saved') {
      const focusedCard = document.activeElement?.dataset.favorite === id;
      renderBrowse(false);
      if (focusedCard) $('#results-title').focus({preventScroll: true});
    }
  }
  function renderPropertyPage() {
    const id = new URLSearchParams(location.search).get('id');
    const p = properties.find(property => property.id === id);
    const back = listingUrl(Object.fromEntries(new URLSearchParams(returnSearch || '')));
    $('#back-to-listings').href = back;
    if (!p) {
      $('#property-unavailable').hidden = false;
      return;
    }

    document.title = `${p.title} | Terviora Estates`;
    const offer = p.listing_type === 'rent' ? 'For rent' : 'For sale';
    const photos = [{image: p.image, label: 'Main view', alt: imgAlt[p.image]}, galleryAngles[p.image]].filter(Boolean);
    const family = Object.values(groups).find(group => group.includes(p.property_type)) || [p.property_type];
    const relevance = other => Number(other.listing_type === p.listing_type) * 4
      + Number(other.property_type === p.property_type) * 2
      + Number(other.location === p.location);
    const related = properties
      .filter(other => other.id !== id && family.includes(other.property_type))
      .sort((a, b) => relevance(b) - relevance(a) || b.posted.localeCompare(a.posted))
      .slice(0, 3);
    detailRoot.innerHTML = `
      <div class="detail-layout">
        <section class="detail-summary glass-medium" aria-labelledby="property-title">
          <p class="eyebrow">${types[p.property_type]} <span aria-hidden="true">·</span> ${offer}</p>
          <h1 id="property-title">${p.title}</h1>
          <p class="detail-location">${p.locality}, ${p.location}, Kerala</p>
          <p class="detail-price">${price(p)}</p>
          ${facts(p)}
          <div class="detail-actions">
            <button class="button button-primary" type="button" data-save-detail="${p.id}" aria-pressed="false">Save to shortlist</button>
            <a class="text-link" href="contact.html?property=${encodeURIComponent(p.id)}">Make an enquiry <span aria-hidden="true">↗</span></a>
          </div>
          <p class="detail-disclosure">Property, price, and photos are for illustration. Viewings are unavailable.</p>
        </section>
        <section class="detail-gallery" aria-label="Property photos">
          <figure class="detail-photo">
            <button class="detail-photo-button" type="button" id="view-property-photo" aria-label="Enlarge property photo">
              <span id="gallery-image">${img(p.image, '', true)}</span>
              <span class="glass-light detail-photo-label" aria-hidden="true">Enlarge ↗</span>
            </button>
          </figure>
          ${photos.length > 1 ? `<div class="detail-gallery-strip">
            <div class="detail-thumbnails" role="group" aria-label="Choose a photo">
              ${photos.map((photo, index) => `<button class="detail-thumbnail" type="button" data-photo-index="${index}" aria-label="Show ${photo.label.toLowerCase()}" aria-pressed="${index === 0}">
                <img src="assets/images/${photo.image}-${index === 0 ? 640 : 240}.webp" width="120" height="80" alt="">
              </button>`).join('')}
            </div>
            <div class="detail-gallery-controls" role="group" aria-label="Gallery navigation">
              <button type="button" class="icon-button" data-photo-step="-1" aria-label="Previous photo">‹</button>
              <span id="gallery-counter" role="status">1 / ${photos.length}</span>
              <button type="button" class="icon-button" data-photo-step="1" aria-label="Next photo">›</button>
            </div>
          </div>` : ''}
        </section>
      </div>
      <section class="detail-about" aria-labelledby="property-about">
        <div><p class="eyebrow">THE PROPERTY</p><h2 id="property-about">About this place</h2><p>${p.description}</p></div>
        <dl class="detail-facts">
          <div><dt>Property type</dt><dd>${types[p.property_type]}</dd></div>
          <div><dt>Area</dt><dd>${p.area.toLocaleString('en-IN')} sq ft</dd></div>
          ${p.furnishing ? `<div><dt>Furnishing</dt><dd>${p.furnishing}</dd></div>` : ''}
          <div><dt>Location</dt><dd>${p.locality}, ${p.location}</dd></div>
        </dl>
      </section>
      ${related.length ? `<section class="detail-related" aria-labelledby="related-title">
        <div class="detail-related-heading"><h2 id="related-title">Related properties</h2><a class="text-link" href="${back}">Browse properties <span aria-hidden="true">↗</span></a></div>
        <div class="property-grid results-grid">${related.map(other => propertyCard(other)).join('')}</div>
      </section>` : ''}`;
    const photoDialog = $('#photo-dialog');
    let currentPhoto = 0;
    const updateGalleryPhoto = (target, sizes) => {
      const photo = photos[currentPhoto];
      const image = document.createElement('div');
      image.innerHTML = img(photo.image, '', true, sizes, photo.alt);
      swapPhoto(target, image.firstElementChild);
    };
    const showEnlargedPhoto = () => {
      const photo = photos[currentPhoto];
      updateGalleryPhoto($('#photo-dialog-image'), '90vw');
      $('#photo-dialog-counter').textContent = `${currentPhoto + 1} / ${photos.length} · ${photo.label}`;
    };
    $('#view-property-photo').addEventListener('click', () => {
      $('#photo-dialog-controls').hidden = photos.length < 2;
      showEnlargedPhoto();
      photoDialog.showModal();
    });
    if (photos.length > 1) {
      const thumbnails = $$('[data-photo-index]', detailRoot);
      const selectPhoto = index => {
        const next = (index + photos.length) % photos.length;
        if (next === currentPhoto) return;
        currentPhoto = next;
        updateGalleryPhoto($('#gallery-image'));
        $('#gallery-counter').textContent = `${currentPhoto + 1} / ${photos.length}`;
        thumbnails.forEach((button, i) => button.setAttribute('aria-pressed', String(i === currentPhoto)));
        if (photoDialog.open) showEnlargedPhoto();
      };
      thumbnails.forEach((button, index) => button.addEventListener('click', () => selectPhoto(index)));
      $$('[data-photo-step]').forEach(button => button.addEventListener('click', () => selectPhoto(currentPhoto + Number(button.dataset.photoStep))));
      for (const surface of [$('.detail-gallery', detailRoot), photoDialog]) {
        surface.addEventListener('keydown', event => {
          if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
          event.preventDefault();
          selectPhoto(currentPhoto + (event.key === 'ArrowRight' ? 1 : -1));
        });
      }
    }
    syncSaved();
  }
  const info = { login:['Your next chapter is taking shape.','Account sign-in is coming with the live platform. For now, you can browse properties and save a shortlist in this browser—no account needed.'],visit:['A closer look, soon.','These are illustrative properties, so visits cannot be arranged. Viewing requests and contact details will become available with real listings.'] };
  function openInfo(key) {const content=info[key];if(!content)return;$('#info-title').textContent=content[0];$('#info-copy').textContent=content[1];$('#info-dialog').showModal();}

  function setupEnquiryForm(form) {
    const selling = form.id === 'sell-form';
    const choice = $('terviora-choice', form);
    const status = $('#enquiry-status', form);
    const copy = $('#enquiry-copy', form);
    const propertyId = new URLSearchParams(location.search).get('property');
    const property = selling ? undefined : properties.find(item => item.id === propertyId);
    const textFields = $$('input[type=text][required], textarea[required]', form);
    let revision = 0;

    if (selling) {
      choice.setOptions([
        {value:'', label:'Choose a property type'},
        ...Object.entries(types).map(([value, label]) => ({value, label}))
      ]);
    } else if (property) {
      choice.value = 'About a listing';
      const reference = $('#enquiry-property', form);
      const link = $('a', reference);
      link.href = propertyUrl(property.id);
      link.textContent = `${property.title} (${property.id})`;
      reference.hidden = false;
    }

    function clearDraft() {
      revision++;
      status.hidden = true;
      copy.hidden = true;
      copy.value = '';
    }

    form.addEventListener('submit', async event => {
      event.preventDefault();
      clearDraft();
      if (!choice.reportValidity()) return;

      const blank = textFields.find(field => !field.value.trim());
      if (blank) {
        blank.setCustomValidity('Please fill in this field.');
        blank.reportValidity();
        return;
      }

      const fields = new FormData(form);
      const message = fields.get('message').trim();
      const lines = [
        selling ? 'Terviora listing enquiry' : 'Terviora property enquiry',
        `Name: ${fields.get('name').trim()}`,
        `Email: ${fields.get('email').trim()}`
      ];
      if (selling) {
        lines.push(`Property type: ${types[choice.value]}`, `Location: ${fields.get('location').trim()}`);
        const askingPrice = fields.get('price');
        if (askingPrice) lines.push(`Asking price: ₹${Number(askingPrice).toLocaleString('en-IN')}`);
      } else {
        lines.push(`Topic: ${choice.value}`);
        if (property) lines.push(`Property: ${property.title} (${property.id})`);
      }
      if (message) lines.push('', message);
      const draft = lines.join('\n');
      const current = revision;
      let copied = false;
      try {
        await navigator.clipboard.writeText(draft);
        copied = true;
      } catch {
        // Keep the draft available for manual copying when clipboard access fails.
      }
      if (current !== revision) return;

      status.textContent = copied ? 'Enquiry copied. It has not been sent.' : 'Your enquiry is ready. Copy the selected text.';
      status.hidden = false;
      if (!copied) {
        copy.value = draft;
        copy.hidden = false;
        copy.focus();
        copy.select();
      }
    });
    form.addEventListener('input', event => {
      if (textFields.includes(event.target)) event.target.setCustomValidity('');
      if (event.target !== copy) clearDraft();
    });
    choice.addEventListener('change', clearDraft);
    $('button[type=submit]', form).disabled = false;
  }
  function setMenu(open) {$('#mobile-nav').hidden=!open;$('#menu-toggle').setAttribute('aria-expanded',String(open));$('#menu-toggle').setAttribute('aria-label',open?'Close navigation':'Open navigation');}
  function updateBudget() {$('#budget-label').textContent=activeTab==='rent'||activeTab==='commercial'&&$('#commercial-intent').value==='rent'?'MONTHLY BUDGET (₹)':'BUDGET (₹)';}
  function setTab(tab) {
    if(!['buy','rent','commercial','land'].includes(tab)) tab='buy';
    const changed=tab!==activeTab; activeTab=tab;
    $$('.search-tabs [role=tab]').forEach(b=>{const selected=b.dataset.tab===tab;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;});
    $('#search-panel').setAttribute('aria-labelledby',`tab-${tab}`);
    const group=tab==='commercial'?'commercial':tab==='land'?'land':'residential';
    const oldType=$('#property-type').value;
    $('#property-type').setOptions([{value:'',label:group==='residential'?'All homes':group==='land'?'All land types':'All commercial types'},...groups[group].map(t=>({value:t,label:types[t]}))]);
    if(groups[group].includes(oldType)) $('#property-type').value=oldType;
    $('#commercial-intent-wrap').hidden=tab!=='commercial';
    $('#bedrooms-wrap').hidden=group!=='residential';$('#furnishing-wrap').hidden=group==='land';
    if(group!=='residential')$('#bedrooms').value='';if(group==='land')$('#furnishing').value='';
    if (changed) {
      $('#budget-min').value = '';
      $('#budget-max').value = '';
      $('#budget-max').setCustomValidity('');
      $('#search-message').hidden = true;
    }
    updateBudget();
  }
  function filterValues() {return {tab:activeTab,location:$('#location').value,type:$('#property-type').value,min:$('#budget-min').value,max:$('#budget-max').value,beds:$('#bedrooms').value,area:$('#min-area').value,furnishing:$('#furnishing').value,by:$('#posted-by').value,intent:$('#commercial-intent').value};}
  function filterProperties(v) {
    const group = v.tab==='commercial'?'commercial':v.tab==='land'?'land':'residential';
    const intent = v.tab==='rent'?'rent':v.tab==='commercial'?v.intent:'sale';
    return properties.filter(p=>p.listing_type===intent && groups[group].includes(p.property_type) && (!v.location||p.location===v.location) && (!v.type||p.property_type===v.type) && (!v.min||p.price>=Number(v.min)) && (!v.max||p.price<=Number(v.max)) && (!v.beds||(p.beds||0)>=Number(v.beds)) && (!v.area||p.area>=Number(v.area)) && (!v.furnishing||p.furnishing===v.furnishing) && (!v.by||p.postedBy===v.by));
  }
  function setCatalogFilters(open) {
    $('#catalog-filters').classList.toggle('is-open', open);
    $('#catalog-filter-toggle').setAttribute('aria-expanded', String(open));
  }

  function renderBrowse(focus = true) {
    const shortlist = resultMode === 'saved';
    const list = shortlist ? properties.filter(p => saved.has(p.id))
      : resultMode === 'all' ? [...properties] : filterProperties(committedFilters);
    list.sort(sorters[$('#results-sort').value]);
    const titles = {buy: 'Homes for sale', rent: 'Homes for rent', commercial: 'Commercial properties', land: 'Plots & land'};
    $$('.site-header [data-nav-tab], #mobile-nav [data-nav-tab]').forEach(link => {
      if (resultMode === 'search' && link.dataset.navTab === committedFilters.tab) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    $('#results-title').textContent = shortlist ? 'Your shortlist' : resultMode === 'all' ? 'All properties' : titles[committedFilters.tab];
    $('#results-summary').textContent=`${list.length} ${list.length===1?'property':'properties'}${shortlist?' in your shortlist':''}.`;
    $('#reset-results').hidden = resultMode === 'all';
    const filters = committedFilters;
    const activeCount = resultMode === 'search'
      ? [filters.location, filters.type, filters.min || filters.max, filters.beds, filters.area, filters.furnishing, filters.by].filter(Boolean).length
      : 0;
    const count = $('#catalog-filter-count');
    count.textContent = activeCount;
    count.hidden = activeCount === 0;
    $('#results-grid').innerHTML=list.map(p=>propertyCard(p)).join('');$('#no-results').hidden=Boolean(list.length);
    $('#no-results h3').textContent=shortlist?'Your next chapter starts with a heart.':'No places match just yet.';
    $('#no-results p').textContent=shortlist?'Save a property using its heart icon, then return here to compare your favourites.':'Try another location or a wider budget.';
    if (focus) {
      setCatalogFilters(false);
      const heading = $('#results-title');
      heading.focus({preventScroll: true});
      heading.scrollIntoView({block: 'nearest', behavior: reducedMotion.matches ? 'instant' : 'smooth'});
    }
  }
  function writeURL(values) {
    const sort = $('#results-sort').value;
    const url = new URL(listingUrl({...values, sort: sort === 'newest' ? '' : sort}), location.href);
    if (url.search !== location.search) history.pushState(null, '', url);
    previousQuery = location.search;
  }
  function search(push=true,focus=true) {
    const v=filterValues();
    if(v.min && v.max && Number(v.min)>Number(v.max)) {$('#budget-max').setCustomValidity('Maximum budget must be at least the minimum budget.');$('#budget-max').reportValidity();$('#search-message').hidden=false;$('#search-message').classList.add('error');$('#search-message').textContent='Please enter a maximum budget that is at least the minimum.';return;}
    $('#budget-max').setCustomValidity('');
    $('#search-message').hidden = true;
    if (!browse) {
      location.assign(listingUrl(v));
      return;
    }
    resultMode = 'search';
    committedFilters = v;
    if (push) writeURL(v);
    renderBrowse(focus);
  }
  function clearFilters() {
    resettingFilters = true;
    $('#property-search').reset();
    resettingFilters = false;
    $('#search-message').hidden = true;
    $('#budget-max').setCustomValidity('');
    $('#extra-filters').hidden = true;
    $('#filter-toggle').setAttribute('aria-expanded', 'false');
    setTab('buy');
  }
  function allProperties() {
    clearFilters();
    resultMode = 'all';
    writeURL({view: 'all'});
    renderBrowse();
  }
  function restoreURL() {
    const params = new URLSearchParams(location.search);
    if (!browse) {
      if (params.has('tab') || ['all', 'saved'].includes(params.get('view'))) {
        location.replace(listingUrl(Object.fromEntries(params)));
      }
      return;
    }
    clearFilters();
    $('#results-sort').value = Object.hasOwn(sorters, params.get('sort')) ? params.get('sort') : 'newest';
    if (!params.has('tab') || ['all', 'saved'].includes(params.get('view'))) {
      resultMode = params.get('view') === 'saved' ? 'saved' : 'all';
      renderBrowse(false);
      return;
    }
    setTab(params.get('tab'));
    for(const [name,id] of Object.entries({location:'location',type:'property-type',min:'budget-min',max:'budget-max',beds:'bedrooms',area:'min-area',furnishing:'furnishing',by:'posted-by',intent:'commercial-intent'})) {
      const element=$('#'+id), value=params.get(name)||'';
      if(element.matches('terviora-choice')){if([...element.options].some(o=>o.value===value))element.value=value;}
      else if(/^\d+$/.test(value) && Number.isSafeInteger(Number(value)))element.value=value;
    }
    if(activeTab==='land'||activeTab==='commercial')$('#bedrooms').value='';if(activeTab==='land')$('#furnishing').value='';
    $('#quick-area').value=[...$('#quick-area').options].some(o=>o.value===$('#min-area').value)?$('#min-area').value:'';
    if ($('#budget-min').value && $('#budget-max').value && Number($('#budget-min').value) > Number($('#budget-max').value)) {
      $('#budget-min').value = '';
      $('#budget-max').value = '';
    }
    updateBudget();if(['bedrooms','min-area','furnishing','posted-by'].some(id=>$('#'+id).value)){ $('#extra-filters').hidden=false;$('#filter-toggle').setAttribute('aria-expanded','true'); }
    search(false,false);
  }
  function categorySearch(category) {
    clearFilters();setTab(category==='commercial'?'commercial':category==='land'?'land':'buy');
    if(!['commercial','land'].includes(category))$('#property-type').value=category;
    search();
  }
  function citySearch(city){clearFilters();$('#location').value=city;search();}
  function keyboardTabs(event,buttons,select,vertical=false) {
    const i=buttons.indexOf(event.target);if(i<0)return;
    let next=i;const forward=vertical?'ArrowDown':'ArrowRight',back=vertical?'ArrowUp':'ArrowLeft';
    if(event.key===forward)next=(i+1)%buttons.length;else if(event.key===back)next=(i-1+buttons.length)%buttons.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=buttons.length-1;else return;
    event.preventDefault();select(buttons[next]);buttons[next].focus();
  }
  const steps=[{image:'modern-villa',copy:'Start with where you want to be. Explore properties by location, budget, and the way you want to live.',caption:'01 / Imagine the everyday, a little differently.',link:'Start exploring',href:'#search'},{image:'modern-interior',copy:'Keep the places you love in one shortlist. With live listings, the next step will be arranging a visit and seeing how a space feels in person.',caption:'02 / Look a little closer. Picture yourself here.',link:'See your shortlist',href:'listings.html?view=saved'},{image:'modern-house',copy:'When you find the right fit, review the details and agree the next steps with the owner or agent. A new chapter deserves a thoughtful beginning.',caption:'03 / A space to make your own.',link:'Explore the collection',href:'listings.html'}];
  function setStep(n) {
    const step = steps[n];
    if (!step) return;
    $$('[data-step]').forEach(button => {
      const selected = Number(button.dataset.step) === n;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    $('#process-content').setAttribute('aria-labelledby', `step-${n}`);
    $('#process-title').innerHTML = ['Property <br>selection', 'Shortlist <br>and visit', 'Your next <br>chapter'][n];
    $('#process-copy').textContent = step.copy;
    $('#process-caption').textContent = step.caption;
    const photo = $('#process-image').cloneNode(false);
    photo.src = `assets/images/${step.image}-1280.webp`;
    photo.alt = imgAlt[step.image];
    swapPhoto($('.process-photo'), photo);
    const link = $('#process-link');
    link.innerHTML = `${step.link} <span aria-hidden="true">↗</span>`;
    link.href = step.href;
  }
  document.addEventListener('click',e=>{
    const favoriteButton=e.target.closest('[data-favorite],[data-save-detail]');if(favoriteButton){toggleSaved(favoriteButton.dataset.favorite||favoriteButton.dataset.saveDetail);return;}
    const infoButton=e.target.closest('[data-info]');if(infoButton){setMenu(false);openInfo(infoButton.dataset.info);return;}
    const close=e.target.closest('[data-close]');if(close){close.closest('dialog').close();return;}
    const tab=e.target.closest('[data-tab]');if(tab){setTab(tab.dataset.tab);return;}
    const category=e.target.closest('[data-category]');if(category){categorySearch(category.dataset.category);return;}
    const city=e.target.closest('[data-city]');if(city){e.preventDefault();citySearch(city.dataset.city);return;}
    const latest=e.target.closest('[data-latest]');if(latest){latestIntent=latest.dataset.latest;renderLatest();return;}
    const step=e.target.closest('[data-step]');if(step){setStep(Number(step.dataset.step));return;}
    if(e.target.closest('#mobile-nav a'))setMenu(false);
  });
  $('#menu-toggle').addEventListener('click',()=>setMenu($('#mobile-nav').hidden));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#mobile-nav').hidden){setMenu(false);$('#menu-toggle').focus();}});
  matchMedia('(min-width:901px)').addEventListener('change',e=>{if(e.matches)setMenu(false);});
  $$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
  function refreshShortlist() {
    loadShortlist();
    syncSaved();
    if (browse && resultMode === 'saved') renderBrowse(false);
  }
  window.addEventListener('storage', event => {
    if (event.key === storageKey || event.key === null) refreshShortlist();
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) refreshShortlist();
  });
  $('#current-year').textContent = new Date().getFullYear();
  const enquiryForm = $('.enquiry-form');
  if (enquiryForm) {
    setupEnquiryForm(enquiryForm);
    return;
  }
  if (detailPage) {
    renderPropertyPage();
    syncSaved();
    return;
  }
  $('#property-search').addEventListener('submit',e=>{e.preventDefault();search();});
  $('#property-search').addEventListener('reset', () => {
    if (resettingFilters) return;
    requestAnimationFrame(() => {
      setTab(activeTab);
      $('#budget-max').setCustomValidity('');
      $('#search-message').hidden = true;
      if (browse) search(true, false);
    });
  });
  ['budget-min','budget-max'].forEach(id=>$('#'+id).addEventListener('input',()=>{$('#budget-max').setCustomValidity('');$('#search-message').hidden=true;}));
  $('#commercial-intent').addEventListener('change',()=>{$('#budget-min').value='';$('#budget-max').value='';$('#budget-max').setCustomValidity('');updateBudget();toast('Budget cleared for the new transaction type.');});
  $('#quick-area').addEventListener('change',()=>{$('#min-area').value=$('#quick-area').value;});
  $('#min-area').addEventListener('input',()=>{const v=$('#min-area').value;$('#quick-area').value=[...$('#quick-area').options].some(o=>o.value===v)?v:'';});
  $('#filter-toggle').addEventListener('click',()=>{const open=$('#extra-filters').hidden;$('#extra-filters').hidden=!open;$('#filter-toggle').setAttribute('aria-expanded',String(open));});
  $('.search-tabs').addEventListener('keydown',e=>keyboardTabs(e,$$('.search-tabs [role=tab]'),b=>setTab(b.dataset.tab)));
  window.addEventListener('popstate',()=>{if(location.search!==previousQuery){previousQuery=location.search;restoreURL();}});
  if (browse) {
    const filterToggle = $('#catalog-filter-toggle');
    filterToggle.addEventListener('click', () => setCatalogFilters(filterToggle.getAttribute('aria-expanded') === 'false'));
    $('#catalog-filters').addEventListener('keydown', event => {
      if (event.key === 'Escape' && filterToggle.offsetParent && filterToggle.getAttribute('aria-expanded') === 'true') {
        setCatalogFilters(false);
        filterToggle.focus();
      }
    });
    $('#reset-results').addEventListener('click', allProperties);
    $('#widen-search').addEventListener('click', allProperties);
    $('#results-sort').addEventListener('change', () => {
      writeURL(resultMode === 'search' ? committedFilters : {view: resultMode});
      renderBrowse(false);
    });
    syncSaved();
    restoreURL();
    return;
  }
  $('.process-tabs').addEventListener('keydown',e=>keyboardTabs(e,$$('.process-tabs [role=tab]'),b=>setStep(Number(b.dataset.step)),true));
  $('#alerts-form').addEventListener('submit',e=>{e.preventDefault();if(!$('#alert-location').reportValidity())return;$('#alert-message').hidden=false;$('#alert-message').textContent='Email alerts are not active yet. Your details have not been sent or stored.';});

  $('#featured-grid').innerHTML=properties.filter(p=>p.featured).map(p=>propertyCard(p)).join('');
  const categories=[['apartment','Apartments','modern-apartment'],['villa','Villas','modern-villa'],['independent_house','Houses','modern-house'],['land','Plots & land','modern-land'],['commercial','Commercial','modern-office']];
  $('#category-grid').innerHTML = categories.map(([type, label, image]) => {
    const count = properties.filter(p => p.listing_type === 'sale' && (groups[type]?.includes(p.property_type) ?? p.property_type === type)).length;
    return `
      <button class="category-card" data-category="${type}">
        <div class="image-clip">${img(image)}</div>
        <div class="category-caption glass-light">
          <div class="category-meta"><h3>${label}</h3><span aria-hidden="true">↗</span></div>
          <p>${count} ${count === 1 ? 'property' : 'properties'} for sale</p>
        </div>
      </button>`;
  }).join('');
  renderLatest();syncSaved();setTab('buy');restoreURL();
})();



