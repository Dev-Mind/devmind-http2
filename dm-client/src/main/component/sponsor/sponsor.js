/**
 * This class is used to display the sessions
 */
export class SponsorCtrl {

  /**
   * Call server to load sessions
   */
  init() {
    fetch('api/sponsors').then(response => {
      response.json().then(json => {
        this.data = json;
        window.document.getElementById('dmSponsors').innerHTML = this._getHtmlContent();
      });
    });
  }

  /**
   * Displays the list of the sponsors
   * @private
   * @return {string} html to display
   */
  _getHtmlContent() {
    if (!this.data) {
      return '';
    }
    let lines = '<div class="dm_sponsors">';
    this.data.forEach(sponsor => {
      lines += `<div class="dm_sponsor__container"><img src="img/${sponsor.logo}" class="dm_sponsor__img img-responsive"></div>`;
    });
    lines += '</div>';
    return lines;
  }
}
