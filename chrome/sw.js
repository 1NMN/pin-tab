const default_options = {
  background: false,
};

chrome.commands.onCommand.addListener(async command => {
  if (command === 'pin-tab') {
    const options = await chrome.storage.sync.get(default_options);
    const tabs = await chrome.tabs.query({
      currentWindow: true,
      highlighted: true
    });
    if (!tabs.length) return;

    // Fetch all tabs in current window to determine positions
    const allTabs = await chrome.tabs.query({ currentWindow: true });

    // Identify the current last pinned and unpinned tab indexes
    const lastPinned = [...allTabs].reverse().find(t => t.pinned);
    const lastUnpinned = [...allTabs].reverse().find(t => !t.pinned);

    let pinnedInsertIndex = lastPinned ? lastPinned.index + 1 : 0;
    let unpinnedInsertIndex = lastUnpinned ? lastUnpinned.index + 1 : allTabs.length;

    let tabToActivate = null;
    let tabToDeactivate = null;

    // Process each highlighted tab
    for (const tab of tabs) {
      const newPinnedState = !tab.pinned;
      await chrome.tabs.update(tab.id, { pinned: newPinnedState });

      // Move tabs to appropriate positions
      if (newPinnedState) {
        await chrome.tabs.move(tab.id, { index: pinnedInsertIndex++ });
      } else {
        await chrome.tabs.move(tab.id, { index: unpinnedInsertIndex++ });
      }

      // Track which tab should have final focus / highlight
      if (tab.active) {
        tabToActivate = options.background ? tab : tab;
        if (options.background) tabToDeactivate = tab;
      }
    }

    // Re-apply tab highlighting after moves
    for (const tab of tabs) {
      await chrome.tabs.update(tab.id, { highlighted: true });
    }
    if (tabToDeactivate) {
      await chrome.tabs.update(tabToDeactivate.id, { highlighted: false });
    }
    if (tabToActivate) {
      await chrome.tabs.update(tabToActivate.id, { highlighted: false });
      await chrome.tabs.update(tabToActivate.id, { highlighted: true });
    }
  }
});
