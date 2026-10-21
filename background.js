chrome.storage.local.get('openIn', item => {
  if (item.openIn) {
    openIn = item.openIn;
  }

  ['page', 'link'].forEach(context => {
    chrome.contextMenus.create({
      contexts: [context],
      id: 'resurrect-' + context,
      title: chrome.i18n.getMessage('resurrect_' + context),
    }, logLastError);

    for (let [name, id, icon] of [
      ['Cachew', 'cachew', 'cachew'],
      ['Archive', 'archive', 'waybackmachine'],
      ['ArchiveList', 'archivelist', 'waybackmachine'],
      ['ArchiveIs', 'archiveis', 'archiveis'],
      ['WebCitation', 'webcitation', 'webcitation'],
      ['IsUp', 'isup', 'isup'],
      ['Ghost Archive', 'ghostarchive', 'ghostarchive'],
    ]) {
      chrome.contextMenus.create({
        contexts: [context],
        icons: {16: 'icons/cacheicons/' + icon + '.png'},
        id: 'resurrect-' + id + '-' + context,
        parentId: 'resurrect-' + context,
        title: chrome.i18n.getMessage('resurrect' + name),
      }, logLastError);
    }

    chrome.contextMenus.create({
      id: 'resurrect-separator-config-' + context,
      type: 'separator',
      contexts: [context],
      parentId: 'resurrect-' + context
    }, logLastError);

    for (let [name, where, checked] of [
      ['CurrentTab', 'current-tab', openIn == openInEnum.CURRENT_TAB],
      ['NewTab', 'new-tab', openIn == openInEnum.NEW_TAB],
      ['BgTab', 'bg-tab', openIn == openInEnum.NEW_BGTAB],
      ['NewWindow', 'new-window', openIn == openInEnum.NEW_WINDOW],
    ]) {
      chrome.contextMenus.create({
        id: 'resurrect-' + where + '-' + context,
        type: 'radio',
        title: chrome.i18n.getMessage('resurrectConfig' + name),
        contexts: [context],
        checked: checked,
        parentId: 'resurrect-' + context
      }, logLastError);
    }
  });
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  let id = info.menuItemId;
  let url = null;
  if (id.endsWith('-page')) {
    url = processPageUrlEdgeCases(info.pageUrl);
    if (!url) return;
  } else if (id.endsWith('-link')) {
    url = info.linkUrl;
  }
  if (id.startsWith('resurrect-cachew-')) {
    goToUrl(genCachewUrl(url), openIn, tab.id);
  } else if (id.startsWith('resurrect-archive-')) {
    goToUrl(genIaUrl(url), openIn, tab.id);
  } else if (id.startsWith('resurrect-archivelist-')) {
    goToUrl(genIaListUrl(url), openIn, tab.id);
  } else if (id.startsWith('resurrect-archiveis-')) {
    goToUrl(genArchiveIsUrl(url), openIn, tab.id);
  } else if (id.startsWith('resurrect-isup-')) {
    goToUrl(genIsUpUrl(url), openIn, tab.id);
  } else if (id.startsWith('resurrect-webcitation-')) {
    goToUrl(genWebCiteUrl(url), openIn, tab.id);
  } else if (id.startsWith('resurrect-ghostarchive-')) {
    goToUrl(genGhostArchiveUrl(url), openIn, tab.id);
  } else if (id.startsWith('resurrect-current-tab-')) {
    setOpenIn(openInEnum.CURRENT_TAB);
  } else if (id.startsWith('resurrect-new-tab-')) {
    setOpenIn(openInEnum.NEW_TAB);
  } else if (id.startsWith('resurrect-bg-tab-')) {
    setOpenIn(openInEnum.NEW_BGTAB);
  } else if (id.startsWith('resurrect-new-window-')) {
    setOpenIn(openInEnum.NEW_WINDOW);
  }
});
