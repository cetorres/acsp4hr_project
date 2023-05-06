const pages = [
  {
    group: null,
    subpages: [
      {
        name: 'Home',
        url: '/home',
        icon: 'house-door'
      }
    ]
  },
  {
    group: 'Datasets',
    subpages: [
      {
        name: 'Browse datasets',
        url: '/datasets',
        icon: 'search'
      },
      {
        name: 'My datasets',
        url: '/my-datasets',
        icon: 'table'
      },
      {
        name: 'Favorite datasets',
        url: '/favorite-datasets',
        icon: 'star-fill'
      }
    ]
  },
  {
    group: 'Requests',
    subpages: [
      {
        name: 'Requests received',
        url: '/requests',
        icon: 'download'
      },
      {
        name: 'Requests sent',
        url: '/my-requests',
        icon: 'upload'
      }
    ]
  },
  {
    group: 'Computations',
    subpages: [
      {
        name: 'Browse computations',
        url: '/computations',
        icon: 'calculator'
      },
      {
        name: 'My results',
        url: '/my-computations',
        icon: 'receipt'
      }
    ]
  },
  {
    group: 'Administrator',
    subpages: [
      {
        name: 'Users',
        url: '/users',
        icon: 'people-fill'
      }
    ]
  }
];

const getPageTitleIconByUrl = (url: string): any => {
  for (let page of pages) {
    for (let sp of page.subpages) {
      if (sp.url == url) {
        //if (page.group) return {title: `${page.group} - ${sp.name}`, icon: sp.icon};
        return { title: sp.name, icon: sp.icon };
      }
    }
  }
  return null;
}

export { pages, getPageTitleIconByUrl };
