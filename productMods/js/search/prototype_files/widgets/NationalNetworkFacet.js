(function ($) {

AjaxSolr.NationalNetworkFacet = AjaxSolr.MultiCheckboxFacet.extend({


  /**
   * Initialize
   */
  init: function () {
    this.setupStore();

    // Default to local search on startup
    nationalSearch = false;

    // Examine the parameters pulled from the URL and look for params
    // for this facet. If there is only one value and it's "Cornell University"
    // then we will assume local search. Otherwise, make it national.
    if (keys = this.manager.store.findByKey('fq', this.field)) {
      var siteNames = this.manager.store.params['fq'][keys[0]].value;
      if (siteNames.length > 1 || siteNames[0] != 'Cornell University') nationalSearch = true;
    }
  },


  /**
   * Alter scope-related params before the request goes out to Solr
   *
   * For a local search, we need to be absolutely sure that results
   * are limited to Cornell for every request. Note the tag used
   * is 'local_search' -- no other facets are configured to ignore this tag,
   * meaning every other widget will be affected by this filter parameter.
   */
  beforeRequest: function() {
    if (nationalSearch == false) {
      var param = new AjaxSolr.Parameter({
        name: 'fq',
        key: this.field,
        value: 'Cornell University',
      });
      if (this.tagAndExclude) {
        param.local('tag', 'local_search');
      }
      if (this.set.call(this, param));
    }
  },


  /**
   * Build the facet
   */
  afterRequest: function () {
    var target = $(this.target);

    // Always empty the facet first
    target.empty();

    // *** LOCAL SEARCH ***

    if (nationalSearch == false) {
      var total = 0;
      var numSites = 0;
      var sites = this.manager.response.facet_counts.facet_fields.siteName;
      for (var site in sites) {
        total += sites[site];
        if (sites[site] > 0) numSites++;
      }

      // Don't display the network teaser if there are no results there.
      if (total < 1) return;

      // Modify relevant classes, move facet lower in layout
      $('#search-controls').removeClass('national-search').addClass('local-search');
      // $('#network-facet').remove().appendTo('#search-controls');

      // Accessing another widget directly might be a bad idea...
      var resultType = this.manager.widgets['classgroup'].getActive();
      var queryText = this.manager.store.get('q').val();

      // Build a message and link for national network results
      var message = $('<p>').text('Found ');
      var institutions = (numSites > 1) ? 'institutions' : 'institution';
      if (resultType == 'all') {
        var resultText = (total > 1) ? 'matches' : 'match';
        var link = $('<a href="#">').text(total+' '+resultText).click(this.changeScope());
        message.append(link).append(' for "'+queryText+'" from '+numSites+' '+institutions+' in the national VIVO network.')
      }
      else {
        var resultText = (total > 1) ? resultType.toLowerCase() : 'result';
        var link = $('<a href="#">').text(total+' '+resultText).click(this.changeScope());
        message.append(link).append(' matching "'+queryText+'" from '+numSites+' '+institutions+' in the national VIVO network.')

      }

      // Add the facet heading
      var heading = $('<h3></h3>').addClass('facet-header').text(this.title);

      target.append(message).prepend(heading);
    }
    else {

    // *** NATIONAL SEARCH ***

      // Modify relevant classes, move facet upward in the layout
      $('#search-controls').removeClass('local-search').addClass('national-search');
      // $('#network-facet').remove().insertAfter('#search-categories');

      if (list = this.buildFacet()) {
        var heading = $('<h3></h3>').addClass('facet-header').text(this.title);
        var scopeToggleLink = $('<a href="#">').text('« Search Cornell University only').click(this.changeScope());
        target.append(heading).append(list).append(scopeToggleLink);
      }
    }
  },


  /**
   * Click handler to switch between local and national search
   */
  changeScope: function() {
    var self = this;
    return function () {
      $(this).blur();

      nationalSearch = (nationalSearch == true) ? false : true;

      // Clear out existing parameters, except classgroup
      self.manager.store.removeByKey('fq', 'siteName');
      self.manager.store.removeByKey('fq', 'type_label');

      self.manager.doRequest(0);
      return false;
    }
  }

});

})(jQuery);