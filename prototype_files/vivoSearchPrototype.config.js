// Variables out here are available throughout the application

var Manager;

// The "Show all" popups for facets are a separate type of widget. Functionally they are very similar
// to the facet widgets, but they retrieve unlimited numbers of facet items from Solr. Because this can
// severely impact the app's performance, so these widgets are not loaded by default. Instead they get
// attached to the Manager dynamically. 

// *** Internal IDs for popups should be the same as the facet, with "_popup" added to the end ***

var popups = {};

// Classgroup in Solr are only URIs, so we need to define their labels here
var groups = {
 'http://vivoweb.org/ontology#vitroClassGrouppeople' : { 'name': 'People', 'value': 'http://vivoweb.org/ontology#vitroClassGrouppeople' },
 'http://vivoweb.org/ontology#vitroClassGrouppublications' : { 'name': 'Publications', 'value': 'http://vivoweb.org/ontology#vitroClassGrouppublications' },
 'http://vivoweb.org/ontology#vitroClassGrouporganizations' : { 'name': 'Organizations', 'value': 'http://vivoweb.org/ontology#vitroClassGrouporganizations' },
 'http://vivoweb.org/ontology#vitroClassGroupevents' : { 'name': 'Events', 'value': 'http://vivoweb.org/ontology#vitroClassGroupevents' },
 'http://vivoweb.org/ontology#vitroClassGroupequipment' : { 'name': 'Equipment', 'value': 'http://vivoweb.org/ontology#vitroClassGroupequipment' },
 'http://vivoweb.org/ontology#vitroClassGroupactivities' : { 'name': 'Activities', 'value': 'http://vivoweb.org/ontology#vitroClassGroupactivities' },
 'http://vivoweb.org/ontology#vitroClassGroupcourses' : { 'name': 'Courses', 'value': 'http://vivoweb.org/ontology#vitroClassGroupcourses' },
 'http://vivoweb.org/ontology#vitroClassGrouptopics' : { 'name': 'Topics', 'value': 'http://vivoweb.org/ontology#vitroClassGrouptopics' },
 'http://vivoweb.org/ontology#vitroClassGrouplocations' : { 'name': 'Locations', 'value': 'http://vivoweb.org/ontology#vitroClassGrouplocations' }
};

(function ($) {

  $(function () {
    
  Manager = new AjaxSolr.Manager({
    solrUrl: 'http://localhost:8080/solr/vivolucene/',
    servlet: 'search'
  });
  
  Manager.setStore(new AjaxSolr.ParameterHashStore()); 
  
  Manager.store.exposed = ['fq','q','start'];
  
  var params = {
    'facet': true,
    'fl': ['name','URI','moniker'],
    'facet.limit': 5,
    'facet.mincount': 1,
    'f.classgroup.facet.limit': 20,
    'facet.field': '{!ex=type,classgroup,type_label,grad_fields,international_focus,research_areas}type',
    'f.type.facet.limit': 1,
    'hl': true,
    'hl.snippets': 2,
    'hl.fl': 'ALLTEXTUNSTEMMED',
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
    target: '#ajax-search-form',
    secondaryTarget: '#search-form' // Site-wide search form
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
      
      var resultType = ' results';
      // Determine which type of results we're trying to show (people, organizations, etc.)
      if (this.manager.store.findByKey('fq', 'classgroup')) {
        var group = this.manager.store.params['fq'][0];
        if (groups[group.value] !== undefined) {
          resultType = groups[group.value].name.toLowerCase();
        }
      }
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
    exclude: 'type,type_label,grad_fields,international_focus,research_areas',
    groups: groups,
    tagAndExclude: true,
    allowMultipleValues: false
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
  
  // Facet: "Graduate fields"
  Manager.addWidget(new AjaxSolr.MultiCheckboxFacet({
    id: 'grad_fields',
    target: '#search-facet-2',
    field: 'labels_http://vivo.library.cornell.edu/ns/0.1#memberOfGraduateField',
    title: 'Graduate Fields',
    tagAndExclude: true,
    allowMultipleValues: true,
    limit: 5
  }));
  popups.grad_fields = new AjaxSolr.MultiCheckboxPopup({
    id: 'grad_fields_popup',
    target: '#search-facet-2-popup',
    field: 'labels_http://vivo.library.cornell.edu/ns/0.1#memberOfGraduateField',
    title: 'Graduate Fields',
    tagAndExclude: true,
    allowMultipleValues: true,
    limit: 9999
  });
  
  // Facet: "International focus"
  Manager.addWidget(new AjaxSolr.MultiCheckboxFacet({
    id: 'international_focus',
    target: '#search-facet-3',
    field: 'labels_http://vivoweb.org/ontology/core#internationalGeographicFocus',
    title: 'International focus',
    tagAndExclude: true,
    allowMultipleValues: true,
    limit: 5
  }));
  popups.international_focus = new AjaxSolr.MultiCheckboxPopup({
    id: 'international_focus_popup',
    target: '#search-facet-3-popup',
    field: 'labels_http://vivoweb.org/ontology/core#internationalGeographicFocus',
    title: 'International focus',
    tagAndExclude: true,
    allowMultipleValues: true,
    limit: 9999
  });
  
  // Facet: "Research areas"
  Manager.addWidget(new AjaxSolr.MultiCheckboxFacet({
    id: 'research_areas',
    target: '#search-facet-4',
    field: 'labels_http://vivoweb.org/ontology/core#hasResearchArea',
    title: 'Research areas',
    tagAndExclude: true,
    allowMultipleValues: true,
    limit: 5
  }));
  popups.research_areas = new AjaxSolr.MultiCheckboxPopup({
    id: 'research_areas_popup',
    target: '#search-facet-4-popup',
    field: 'labels_http://vivoweb.org/ontology/core#hasResearchArea',
    title: 'Research areas',
    tagAndExclude: true,
    allowMultipleValues: true,
    limit: 9999
  });
  
  Manager.init();
  
  // Run a search after the page loads
  Manager.doRequest(0);
  
  });
})(jQuery);