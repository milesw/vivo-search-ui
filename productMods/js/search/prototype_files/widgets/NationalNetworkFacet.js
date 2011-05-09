(function ($) {

AjaxSolr.NationalNetworkFacet = AjaxSolr.MultiCheckboxFacet.extend({


  /**
   * Initialize
   */
  init: function () {
    this.setupStore();

    // Default to local search on startup
    // nationalSearch = false;

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
    $('#results-header').empty();
  },


  /**
   * Build the facet
   */
  afterRequest: function () {
    this.updateHeader();

    var target = $(this.target);

    // Always empty the facet first
    target.empty();

    // Update the search scope on the search form dropdown menu
    var searchForm = this.manager.widgets['search'].target;
    var inputValue = (nationalSearch) ? 'national' : 'local';
    $('input[value='+inputValue+']', searchForm).attr('checked', 'true');

    // *** LOCAL SEARCH ***

    if (nationalSearch == false) {
      var total = 0;
      var numSites = 0;

      // Go through the siteName facet and gather an institution count
      // and a result count.
      var sites = this.manager.response.facet_counts.facet_fields.siteName;
      for (var site in sites) {
        // Do not include Cornell in national result count
        if (site !== 'Cornell University') {
          total += sites[site];
          if (sites[site] > 0) numSites++;
        }
      }

      // Don't display the network teaser if there are no results there.
      if (total < 1) return;

      // Modify relevant classes, move facet lower in layout
      $('#search-controls').removeClass('national-search').addClass('local-search');
      // $('#network-facet').remove().appendTo('#search-controls');

      // Accessing another widget directly might be a bad idea...
      resultType = this.manager.widgets['classgroup'].getActive();
      var queryText = this.manager.store.get('q').val();

      // Build a message and link for national network results
      var message = $('<p>').text('Found ');
      var institutions = (numSites > 1) ? 'institutions' : 'institution';
      if (resultType == 'all') {
        var resultText = (total > 1) ? 'matches' : 'match';
        var link = $('<a href="#">').text(total+' '+resultText).click(this.changeScope());
        message.append(link).append(' for "'+queryText+'" from '+numSites+' other '+institutions+' in the national VIVO network.')
      }
      else {
        var resultText = (total > 1) ? resultType.toLowerCase() : 'result';
        var link = $('<a href="#">').text(total+' '+resultText).click(this.changeScope());
        message.append(link).append(' matching "'+queryText+'" from '+numSites+' other '+institutions+' in the national VIVO network.')

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
  },

  /**
   * Display a result count and institution select menu at the top of the page
   */
  updateHeader: function() {
    var total = this.manager.response.response.numFound;
    var totalText = (total > 1) ? total+' results' : total+' result';

    // Get all institutions and sort alphabetically
    var institutions = this.facets();
    institutions.sort(function(a, b) {
      var A = a.value.toLowerCase(), B = b.value.toLowerCase();
      if (A < B) return -1;
      if (A > B) return 1;
      return 0;
    });

    var activeInstitutions = this.getActive();

    // Add up all the facet counts for other institutions
    var counts = this.manager.response.facet_counts.facet_fields.siteName;
    var allTotal = 0;
    for (var site in counts) {
      allTotal += counts[site];
    }

    // Create a select list.
    var selectList = $('<select class="select-institution" />');
    selectList.append('<option value="all">All VIVO institutions ('+allTotal+')</option>');
    selectList.append('<option disabled="true">----------------------</option>');

    // Add options for each institution, make them disabled if there is no count.
    for (var i=0; i < institutions.length; i++) {
      var institution = institutions[i].value;
      var count = institutions[i].count;
      if (count > 0) selectList.append('<option value="'+institution+'">'+institution+' ('+count+')</option>');
      else selectList.append('<option value="'+institution+'" disabled="true">'+institution+'</option>');
    }

    // Determine which option should be active and remove the count for that option.
    if (activeInstitutions.length == 0) {
      // 1. All VIVO instititions
      selectList.children('option[value="all"]').text('All VIVO institutions').attr('selected', true);
    }
    else if (activeInstitutions.length > 1) {
      // 2. Multiple instititution selected from the checkbox facet.
      selectList.prepend('<option disabled="true">----------------------</option>');
      selectList.prepend('<option selected="true">'+activeInstitutions.length+' selected institutions</option>');
    }
    else if (activeInstitutions.length == 1)  {
      // 3. Only a single instititution selected
      target = activeInstitutions[0];
      selectList.children('option[value="'+target+'"]').text(target).attr('selected', true);
    }

    if (total > 0) {
      var handler = this.headerChangeHandler();
      $('#results-header').html('<strong>'+totalText+'</strong> from ').append(selectList.change(handler));
    }
  },

  /**
   * Updates results after a new institution has been selected from the menu
   */
  headerChangeHandler: function() {
    var self = this;
    return function() {
      var value = $('#results-header select option:selected').attr('value');

      nationalSearch = true;

      // 'All VIVO institutions' was selected
      if (value == 'all') {
        self.clear();
        self.manager.doRequest(0);
        return false;
      }

      var param = new AjaxSolr.Parameter({
        name: 'fq',
        key: self.field,
        value: [value],
        filterType: 'subquery',
        operator: 'OR'
      });

      if (self.tagAndExclude) {
        param.local('tag', self.id);
      }

      if (self.set.call(self, param)) {
        self.manager.doRequest(0);
      }
      return false;
    }
  }

});

})(jQuery);