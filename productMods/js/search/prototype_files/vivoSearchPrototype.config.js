// Variables out here are available throughout the application

var Manager;

// The "Show all" popups for facets are a separate type of widget. Functionally they are very similar
// to the facet widgets, but they retrieve unlimited numbers of facet items from Solr. Because this can
// severely impact the app's performance, these widgets are not loaded by default. Instead they get
// attached to the Manager dynamically.

// *** Internal IDs for popups should be the same as the facet, with "_popup" appended ***
var popups = {};

var groups = {
  people : { name: 'People', value: 'people' },
  organizations : { name: 'Organizations', value: 'organizations' },
  publications : { name: 'Publications', value: 'publications' },
  events : { name: 'Events', value: 'events' },
  activities : { name: 'Activities', value: 'activities' },
  locations : { name: 'Locations', value: 'locations' },
  courses : { name: 'Courses', value: 'courses' },
  topics : { name: 'Topics', value: 'topics' }
  // equipment : { name: 'Equipment', value: 'equipment' },
  // research : { name: 'Research', value: 'research' }
};

// Variable that represents the current search scope
var nationalSearch = false;

var prototypeURL = 'http://localhost:8080/vivo';

(function ($) {

  $(function () {

  Manager = new AjaxSolr.Manager({
    solrUrl: 'http://localhost:8080/solr/vivoprototype/',
    servlet: 'search'
  });

  Manager.setStore(new AjaxSolr.ParameterHashStore());

  Manager.store.exposed = ['fq','q','start'];

  var params = {
    'facet': true,
    'fl': ['name','URI','moniker','siteName','siteURL'],
    'facet.mincount': 1,
    'facet.field': '{!ex=type_label,classgroup,national_search}siteURL', // Workaround used to display a count for "All"
    'f.classgroup.facet.limit': 20,
    'f.siteName.facet.mincount': '0', // Breaks when evaluating zero as a number
    'hl': true,
    'hl.snippets': 2,
    'hl.fl': 'alltext',
    'hl.fragsize': 120,
    'rows': 10,
    'json.nl': 'map'
  };
  for (var name in params) {
    Manager.store.addByValue(name, params[name]);
  }

  // Search form(s)
  Manager.addWidget(new AjaxSolr.SearchText({
    id: 'search',
    target: '#search-form',
  }));

  // Results area
  Manager.addWidget(new AjaxSolr.ResultWidget({
    id: 'results',
    target: '#results'
  }));

  // Pagination
  Manager.addWidget(new AjaxSolr.PagerWidget({
    id: 'pager',
    target: '#pager',
    prevLabel: '&laquo; PREV',
    nextLabel: 'NEXT &raquo;',
    innerWindow: 1,
    // Add the result counts outside the pager area
    renderHeader: function (perPage, offset, total) {
      // Update the element that holds result counts
      if (this.manager.response.response.numFound > 0) {
        $('#results-header').html($('<span/>').text(Math.min(total, offset + 1) + ' – ' + Math.min(total, offset + perPage) + ' of ' + total + ' ' + resultType));
      }
    },
    beforeRequest: function() {
      $('#results-header').empty();
      $(this.target).empty();
    }
  }));

  // Classgroup menu
  Manager.addWidget(new AjaxSolr.GroupFacet({
    id: 'classgroup',
    target: '#search-categories',
    field: 'classgroup',
    exclude: ['type_label','national_search'],
    groups: groups,
    tagAndExclude: true,
    allowMultipleValues: false
  }));

  // Local / national scope
  Manager.addWidget(new AjaxSolr.NationalNetworkFacet({
    id: 'national_search',
    target: '#network-facet',
    field: 'siteName',
    title: 'National VIVO results',
    exclude: ['type_label','local_search'],
    tagAndExclude: true,
    allowMultipleValues: true,
    limit: 100,
  }));

  // Facet: "Type"
  Manager.addWidget(new AjaxSolr.MultiCheckboxFacet({
    id: 'type_label',
    target: '#search-facet-1',
    field: 'type_label',
    title: 'Type',
    tagAndExclude: true,
    allowMultipleValues: true,
    limit: 5,
  }));
  popups.type_label = new AjaxSolr.MultiCheckboxPopup({
    id: 'type_label_popup',
    target: '#search-facet-1-popup',
    field: 'type_label',
    title: 'Type',
    tagAndExclude: true,
    allowMultipleValues: true,
    limit: 9999
  });

  Manager.init();

  // Run a search after the page loads
  Manager.doRequest(0);

  });
})(jQuery);