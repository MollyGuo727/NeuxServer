/* hs-eslint ignored failing-rules */
/* eslint-disable hubspot-dev/no-unsafe-storage */
/* eslint-disable hubspot-dev/no-confusing-browser-globals */

'use es6';

import sprocketWhiteImageUrl from 'bender-url!./sprocket_white.svg';
import sprocketOrangeImageUrl from 'bender-url!./sprocket_orange.svg';
import toolsMenuCssUrl from 'bender-url!../css/toolsmenu.css';
import { localDevClassList } from './constants';
export default class SprocketMenu {
  constructor(options) {
    this.baseUrl = this.getHsBaseUrl(options.app_hs_base_url);
    this.cpBaseUrl = this.getHsBaseUrl(options.cp_hs_base_url);
    this.contentId = options.dynamic_page_id && options.dynamic_page_id !== '0' && options.dynamic_page_id !== 'null' ? options.dynamic_page_id : options.page_id;
    this.categoryId = options.category_id;
    this.contentGroupId = options.content_group_id;
    this.portalId = options.portal_id;
    this.environments = {
      PRODUCTION: 1,
      STAGING: 2
    };
    this.isCustomerPortal = options.is_customer_portal === true;
    this.cmsEnvironment = this.getCmsEnvironmentFromCookie();
    this.contentUrl = this.getHsContentUrl();
    this.permissionObj = {};
  }
  getHsBaseUrl(baseUrl) {
    return window.localStorage.getItem('HS_LOCAL_TESTING') ? baseUrl.replace(/[^/](\w+?)(?=\.)/, 'local') : baseUrl;
  }
  getHsContentUrl() {
    const contentUrl = window.location.href.split('?')[0];
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('hs_preview')) {
      return `${contentUrl}?hs_preview=${searchParams.get('hs_preview')}`;
    } else {
      return contentUrl;
    }
  }
  createElementFromHTML(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
  }
  jsonp(url, callback) {
    window.jsonpHandler = data => {
      callback(data);
    };
    const src = `${url}${url.indexOf('?') !== -1 ? '&' : '?'}callback=jsonpHandler`;
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.referrerPolicy = 'no-referrer-when-downgrade';
    script.async = true;
    script.src = src;
    document.getElementsByTagName('head')[0].appendChild(script);
  }
  httpGet(url, callback) {
    const request = new XMLHttpRequest();
    request.withCredentials = true;
    request.onreadystatechange = function () {
      if (this.readyState === 4 && this.status === 200) {
        callback(JSON.parse(this.responseText));
      }
    };
    request.open('GET', url, true);
    request.send();
  }
  showToolsMenuIfAuthor() {
    let resourceName;
    let resourceId = this.contentId;
    const resourceUrl = this.contentUrl;
    let canPrefetchEditorForResource = false;
    if (this.isCustomerPortal) {
      resourceName = 'customer-portal';
    } else if (window.location.pathname.endsWith('_hcms/mem/login')) {
      resourceName = 'content-membership';
    } else if (this.contentId && this.contentGroupId) {
      if (this.categoryId === 7) {
        resourceName = 'blog-listing-pages';
      } else if (this.categoryId === 6 || this.categoryId === 12) {
        resourceName = 'knowledge-articles';
      } else if (this.categoryId === 13) {
        resourceName = 'case-studies';
      } else {
        resourceName = 'blog-posts';
      }
    } else if (this.contentGroupId) {
      if (this.categoryId === 6) {
        resourceName = 'knowledge-bases';
      } else {
        resourceName = 'blogs';
      }
      resourceId = this.contentGroupId;
    } else {
      canPrefetchEditorForResource = true;
      resourceName = 'landing-pages';
    }
    const hasPermissionUrl = `${this.baseUrl}/content-tools-menu/api/v1/tools-menu/has-permission-json?portalId=${this.portalId}`;
    this.httpGet(hasPermissionUrl, data => {
      if (data.has_permission) {
        const permissionsUrl = `${this.cpBaseUrl}/content-tools-menu/api/v1/tools-menu/permissions?portalId=${this.portalId}`;
        this.httpGet(permissionsUrl, response => {
          this.permissionObj = response;
          if (resourceName === 'content-membership') {
            this.getContentMembershipCookie(resourceName, this.portalId);
          } else {
            this.getAppLinks(resourceName, resourceId, this.portalId, resourceUrl);
          }
          if (canPrefetchEditorForResource) {
            this.setupDeferredPrefetchingOfEditorAssets(resourceName);
          }
        });
      }
    });
  }
  getContentMembershipCookie(resourceName, portalId) {
    this.jsonp(`${this.baseUrl}/content-tools-menu/api/v1/content/validate-hubspot-user?redirect_url=${window.location.href}&portalId=${portalId}`, data => {
      if (data && data.verified) {
        const redirectUrl = this.getUrlParameter('redirect_url');
        const finalRedirectUrl = redirectUrl || data.redirectUrl || window.location.origin;
        window.location.href = `/_hcms/mem/automatic-login-loading-message?redirect_url=${finalRedirectUrl}`;
      }
    });
  }
  getAppLinks(resourceName, pk, portalId, contentUrl) {
    this.httpGet(`${this.baseUrl}/content-tools-menu/api/v1/tools-menu/${resourceName}/${pk}/actions-json?portalId=${portalId}&clientUrl=${contentUrl}`, data => {
      if (data.actions && data.strings) {
        this.showAppLinks(data.actions, data.strings);
      }
    });
  }
  renderAction(link) {
    const className = link[2] ? `class='${link[2]}'` : '';
    const href = link[1] ? `href='${link[1]}'` : '';
    return `\
<li><a target='_blank' ${href} ${className}>
${link[0]}
</a></li>\
`;
  }
  showAppLinks(actions, strings) {
    // Insert site maps link if there is a site map on the page
    const mapWidgets = [].slice.call(document.querySelectorAll('[data-menu-id]')).filter(element => !!element.getAttribute('data-menu-id').trim());
    const mapWidget = mapWidgets.length > 0 ? mapWidgets[0] : null;
    if (mapWidget !== null) {
      const dataMenuId = mapWidget.getAttribute('data-menu-id').trim();
      actions.push([strings.EDIT_NAVIGATION_MENU, `${this.baseUrl}/menus/${this.portalId}/edit/${dataMenuId}`]);
    }

    // push local dev item to actions list before rendering
    actions.push(['Open Local Dev Server', '', 'hs-local-dev-server']);
    let links = actions.map(this.renderAction).join('');
    if (this.permissionObj.permissions.includes('CAN_PREVIEW_ENVIRONMENTS')) {
      links += `\
        <li><a class="hs-environment-buffer-on">${strings.VIEW_BUFFER}</a></li>\
        <li><a class="hs-environment-buffer-off">${strings.VIEW_HARD}</a></li>\
      `;
      links += `\
        <li><a class="hs-environment-staging">${strings.VIEW_STAGING}</a></li>\
        <li><a class="hs-environment-production">${strings.VIEW_PRODUCTION}</a></li>\
      `;
    }
    const css = `<link rel="stylesheet" href="${toolsMenuCssUrl}" />`;
    const menu = `
      <div role="button" class="hs-tools-menu hs-collapsed" aria-expanded="false">
        <img class="hs-sprocket" alt="${strings.MENU_ICON_ALT_TEXT}" src="${sprocketWhiteImageUrl}" />
        <div class="hs-dropdown">
          <div class="hs-title">${strings.MENU_TITLE}</div>
          <ul class="hs-tools-actions">
            ${links}
            <li>
              <a role="button" href="#hide-menu" class="hs-menu-hider">${strings.HIDE_THIS_MENU}</a>
            </li>
          </ul>
        </div>
      </div>
    `;
    document.body.appendChild(this.createElementFromHTML(css));
    document.body.appendChild(this.createElementFromHTML(menu));
    this.registerEvents();
  }
  registerEvents() {
    const element = document.querySelector('.hs-tools-menu');
    this.registerDropdown(element);
    element.querySelector('.hs-menu-hider').addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      element.style.display = 'none';
    });
    const bufferOn = element.querySelector('.hs-environment-buffer-on');
    if (bufferOn) {
      if (!this.cmsEnvironment.buffer) {
        bufferOn.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
          this.requestAndSetEnvironmentCookie(this.portalId, true, this.cmsEnvironment.environmentId);
        });
      } else {
        bufferOn.parentElement.removeChild(bufferOn);
      }
    }
    const bufferOff = element.querySelector('.hs-environment-buffer-off');
    if (bufferOff) {
      if (this.cmsEnvironment.buffer) {
        bufferOff.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
          this.requestAndSetEnvironmentCookie(this.portalId, false, this.cmsEnvironment.environmentId);
        });
      } else {
        bufferOff.parentElement.removeChild(bufferOff);
      }
    }
    const stagingEnv = element.querySelector('.hs-environment-staging');
    if (stagingEnv) {
      if (this.cmsEnvironment.environmentId !== this.environments.STAGING) {
        stagingEnv.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
          this.requestAndSetEnvironmentCookie(this.portalId, this.cmsEnvironment.buffer, this.environments.STAGING);
        });
      } else {
        stagingEnv.parentElement.removeChild(stagingEnv);
      }
    }
    const productionEnv = element.querySelector('.hs-environment-production');
    if (productionEnv) {
      if (this.cmsEnvironment.environmentId !== this.environments.PRODUCTION) {
        productionEnv.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
          this.requestAndSetEnvironmentCookie(this.portalId, this.cmsEnvironment.buffer, this.environments.PRODUCTION);
        });
      } else {
        productionEnv.parentElement.removeChild(productionEnv);
      }
    }
  }
  requestAndSetEnvironmentCookie(portalId, buffer, environmentId) {
    const cookieUrl = `${this.cpBaseUrl}/content-tools-menu/api/v1/tools-menu/environment-cookie?portalId=${portalId}&environmentId=${environmentId}&buffer=${buffer}`;
    this.httpGet(cookieUrl, data => {
      document.cookie = `hs_cms_environment=${btoa(JSON.stringify(data))}`;
      window.location.reload();
    });
  }
  registerDropdown(element) {
    const menuIconElement = Array.from(element.children).find(child => {
      return child.classList.contains('hs-sprocket');
    });
    const hideDropdown = () => {
      element.classList.add('hs-collapsed');
      element.setAttribute('aria-expanded', false);
      menuIconElement.setAttribute('src', sprocketWhiteImageUrl);
    };
    const showDropdown = () => {
      element.classList.remove('hs-collapsed');
      element.setAttribute('aria-expanded', true);
      menuIconElement.setAttribute('src', sprocketOrangeImageUrl);

      // Also removing display: none on the first show (which is needed to ensure
      // there is no flash of menu content before the CSS loads)
      element.querySelector('.hs-dropdown').style.display = '';
    };
    const bodyClickHandler = () => {
      hideDropdown();
      document.body.removeEventListener('click', bodyClickHandler);
    };
    const menuClickHandler = event => {
      if (event.target.getAttribute('href') !== null && !event.target.classList.contains('hs-local-dev-server')) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      if (event.target.classList.contains('hs-local-dev-server')) {
        this.setUpLocalDevUrl();
        return;
      }
      if (element.classList.contains('hs-collapsed')) {
        showDropdown();
        document.body.addEventListener('click', bodyClickHandler);
      } else {
        hideDropdown();
        document.body.removeEventListener('click', bodyClickHandler);
      }
    };
    element.addEventListener('click', menuClickHandler, false);
  }
  getUrlParameter(name) {
    name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp(`[\\?&]${name}=([^&#]*)`);
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }
  getCmsEnvironmentFromCookie() {
    const cookieStr = this.getCookie('hs_cms_environment');
    if (cookieStr) {
      return JSON.parse(atob(cookieStr));
    } else {
      return {
        portalId: 0,
        environmentId: this.environments.PRODUCTION,
        buffer: false,
        createdAt: 0
      };
    }
  }
  getCookie(cookieName) {
    const name = `${cookieName}=`;
    const cookieArr = document.cookie.split(';');
    for (let i = 0; i < cookieArr.length; i++) {
      let c = cookieArr[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  }

  // Two seconds after window load, fetch a small script that in turn, appends
  // abunch of <link rel="prefetch"> tags to the page. The idea is to use the
  // idle time of the users page load to get a jump start on loading the heavy
  // assets of the editor. The prefetches are given the lowest priority by the
  // browser, so it hopefully doesn't interfere with the users page.
  // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Link_prefetching_FAQ
  setupDeferredPrefetchingOfEditorAssets(resourceName) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        let prefetcherPath;
        if (resourceName === 'landing-pages') {
          prefetcherPath = 'content/editor/prefetcher.js';
        } else {
          return;
        }
        const script = document.createElement('script');
        script.src = `${this.baseUrl}/${prefetcherPath}`;
        document.head.appendChild(script);
      }, 2000);
    });
  }

  /* Local Dev Server / JS Building Blocks
     Sets up the local dev server link to a proxy url if the localhost server is running
  */
  setUpLocalDevUrl() {
    let hostName = window.location.hostname;
    let pathName = window.location.pathname;
    const pageQueryParams = window.location.search;
    const localDevServerLink = document.querySelector('.hs-tools-menu .hs-tools-actions .hs-local-dev-server');

    // For when running with local renderer
    if (pageQueryParams) {
      pageQueryParams.slice('1').split('&').forEach(param => {
        if (param.indexOf('hsDebugOverridePublicHost') > -1) {
          hostName = param.split('=')[1];
          pathName = pathName.replace('/cos-rendering/v1/public', '');
        }
      });
    }
    const paramMap = {
      hostName,
      pathName,
      protocol: window.location.protocol,
      contentId: this.contentId,
      portalId: this.portalId
    };
    const params = Object.keys(paramMap).map(key => `${key}=${paramMap[key]}`).join('&');
    const resetUI = this.resetLocalDevLink.bind(this);
    const onSuccess = this.setLocalDevServerSuccess.bind(this);
    const onFailure = this.setLocalDevServerFailure.bind(this);
    resetUI(localDevServerLink);
    fetch(`http://localhost:1442/check-if-local-dev-server?${params}`).then(response => {
      if (!response.ok) {
        throw response.statusText;
      }
      return response.json();
    }).then(data => onSuccess(data, localDevServerLink)).catch(error => {
      console.error(error);
      onFailure(localDevServerLink);
    });
  }
  resetLocalDevLink(serverLink) {
    serverLink.classList.remove(localDevClassList.SUCCESS, localDevClassList.WARNING, localDevClassList.FAILURE);
    serverLink.removeAttribute('href', 'title');
  }
  setLocalDevServerSuccess(localDevData, serverLink) {
    if (!localDevData.localProxyUrl) {
      serverLink.classList.add(localDevClassList.WARNING);
      serverLink.setAttribute('title', 'Proxy unavailable - Click to retry');
      return;
    }
    serverLink.setAttribute('href', localDevData.localProxyUrl);
    serverLink.classList.add(localDevClassList.SUCCESS);
    window.open(localDevData.localProxyUrl, '_blank');
  }
  setLocalDevServerFailure(serverLink) {
    serverLink.classList.add(localDevClassList.FAILURE);
    serverLink.setAttribute('title', 'Local server not running - Click to retry');
  }
}