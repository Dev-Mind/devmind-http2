/**
 * In this class we register the controllers used in our pages
 */

import {HomeCtrl} from './home/home.js';
import {SessionCtrl} from './session/session.js';
import {SessionDetailCtrl} from './session/session-detail.js';
import {SpeakerCtrl} from './speaker/speaker.js';
import {SpeakerDetailCtrl} from './speaker/speaker-detail.js';
import {SponsorCtrl} from './sponsor/sponsor.js';

/* eslint-env browser */
export class Application {

  constructor() {
    this.components = new Map();
    this.oldtarget = undefined;

    if (!self.fetch) {
      console.error('This app used the fetch API to load data, but your browser don\'t support this feature. Add a pollyfill');
    }
    // Register all the components
    this._registerComponent('home', '()', new HomeCtrl(), 'home/home.html');
    this._registerComponent('session', '(session)', new SessionCtrl(), 'session/session.html');
    this._registerComponent('session-detail', '(session/)(\\w+)', new SessionDetailCtrl(), 'session/session-detail.html');
    this._registerComponent('speaker', '(speaker)', new SpeakerCtrl(), 'speaker/speaker.html');
    this._registerComponent('speaker-detail', '(speaker/)(\\w+)', new SpeakerDetailCtrl(), 'speaker/speaker-detail.html');
    this._registerComponent('sponsor', '(sponsor)', new SponsorCtrl(), 'sponsor/sponsor.html');

    this._initUrl();
  }

  /**
   * This event handler reload the good template when the hash change in location
   */
  locationHashChanged() {
    this._initUrl();
  }

  /**
   * If user refresh a screen the component name is read in the URL. The default one is
   * session component
   * @private
   */
  _initUrl() {
    let hash = window.location.hash;
    let target = hash ? hash.substr(1, hash.length) : 'home';
    let go;

    // Mini router
    this.components.forEach((value, key) => {
      // If pattern match we know the target
      if (target.match(value.pattern)) {
        let args = target.split('/');
        args[0] = key;
        go = args;
      }
    });
    this.go(go ? go : 'home');
  }

  /**
   * Register a new controller and a view to be able to load them later.
   * @param {string} name of the component
   * @param {string} pattern to be able to mach with URL
   * @param {Object} ctrl used by the component
   * @param {string} view path
   * @private
   */
  _registerComponent(name, pattern, ctrl, view) {
    this.components.set(name, {
      controller: ctrl,
      pattern: pattern,
      view: view
    });
  }

  /**
   * Load a template in the main page
   * @param {Array} args component name and all the options
   */
  go(args) {
    args = args instanceof Array ? args : [args];
    let [action, ...options] = args;
    this._activeElement(`nav__${this.oldtarget}`, false);
    this.oldtarget = action;
    this._activeElement(`nav__${action}`, true);
    this._displayContent(action, 'dmContent', options);
    this._displayContent('sponsor', 'dmSponsor', options);
  }

  /**
   * Displays a component
   * @param {string} action is the name of the controller
   * @param {string} target is the html id where content will be injected
   * @param {Array} options sent to the controller
   * @private
   */
  _displayContent(action, target, options) {
    let component = this.components.get(action);
    fetch(component.view).then(response => {
      response.text().then(html => document.getElementById(target).innerHTML = html);
    });
    component.controller.init(options);
  }

  /**
   * Active or desactive an element of the menu
   * @param {number} id of the element
   * @param {boolean} active indicator to add or remove the classname 'active'
   * @private
   */
  _activeElement(id, active) {
    if (!id) {
      return;
    }
    let element = document.getElementById(id);
    if (element) {
      if (active) {
        element.classList.add('active');
      } else {
        element.classList.remove('active');
      }
    }
  }
}
