(function ($) {

AjaxSolr.GroupFacet = AjaxSolr.AbstractFacetWidget.extend({
  
  
  /**
   * On startup, create the classgroup menu even if there are no search terms yet
   */
  init: function () {
    this.setupStore();
    var active = this.getActive();
    
    var list = $("<ul></ul>").append(AjaxSolr.theme('category_link', 'All', '0', (active == 'all') ? true : false, this.allResultsClickHandler()));
    for (var uri in groups) {
      var activeClass = (active == groups[uri].value) ? true : false;
      list.append(AjaxSolr.theme('category_link', groups[uri].name, 0, activeClass, this.clickHandler(groups[uri])));
    };
    
    $(this.target).empty().append(list);
  },
  
  
  /**
   * Override original setup so we can exlude all tagged filters from counts
   */
  setupStore: function () {
    this.manager.store.addByValue('facet', true);
    
    var facetParam = new AjaxSolr.Parameter({
      name: 'facet.field',
      value: this.field
    });
    if (this.tagAndExclude) {
      // We want to exclude all filters, including this one
      facetParam.local('ex', this.field+','+this.exclude);
    }
    this.manager.store.add(facetParam.name, facetParam);

    if (this.limit !== null) {
      this.manager.store.addByValue('f.' + this.field + '.facet.limit', this.limit);
    }
  },
  
  
  /**
   * Build the groups facet
   */
  afterRequest: function () {
    var facets = this.facets();
    var counts = {};
    
    // Add newly returned counts to our group list
    if (facets.length != 0) {
      for (var i in facets) {
        counts[facets[i].value] = facets[i].count;
      }
    }
    
    var active = this.getActive();
    
    // The real count for 'all' is getting pulled from the 'type' facet, by getting the count for owl:Thing
    // This is a hacky workaround since we don't get a count for 'All' with the rest of the facet counts
    var total = (this.manager.response.facet_counts.facet_fields.type !== undefined) ? this.manager.response.facet_counts.facet_fields.type['http://www.w3.org/2002/07/owl#Thing'] : 0;
    
    var list = $('<ul></ul>').addClass('search-categories-list').append(AjaxSolr.theme('category_link', 'All', total, (active == 'all') ? true : false, this.allResultsClickHandler()));
    
    for (var uri in groups) {
      var count = (counts[uri] !== undefined) ? counts[uri] : 0;
      var activeClass = (uri == active) ? true : false;
      list.append(AjaxSolr.theme('category_link', groups[uri].name, count, activeClass, this.clickHandler(groups[uri])));
    }
    
    $(this.target).empty().append(list);
  },
  
  
  /**
   * Click handler for classgroup menu items
   */
  clickHandler: function (facet) {
    var self = this;
    var param = new AjaxSolr.Parameter({
      name: 'fq',
      key: this.field,
      value: facet.value,
    });
    if (this.tagAndExclude) {
      param.local('tag', this.field);
    }

    return function () {
      // Remove any popup widgets which will be causing
      // lots of extra facet data to be requested
      
      // Unbind popup widgets from Manager
      for (var id in self.manager.widgets) {
        if (id.indexOf('_popup') > -1) {
          delete self.manager.widgets[id];
        }
      }
      // Kill any lingering popups in the DOM
      $('.ui-dialog-content').dialog('destroy');
      
      // Remove all other filter queries before changing classgroups
      self.manager.store.remove('fq');
      
      // Don't run requests if there is no query text
      var q = self.manager.store.get('q');
      if (self.set.call(self, param) && q.value) {
        self.manager.doRequest(0);
      }
      return false;
    }
  },
  
  
  /**
   * Click handler for "All" link
   */
  allResultsClickHandler: function() {
    var self = this;
    
    return function () {
      // Remove all other filter queries before changing classgroups
      self.manager.store.remove('fq');
      
      // Don't run requests if there is no query text
      var q = self.manager.store.get('q');
      if (q.value) {
        self.manager.doRequest(0);
      }
      return false;
    }
  },
  
  
  /**
   * Find the active classgroup
   */
  getActive: function() {
    var active = 'all';
    if (keys = this.manager.store.findByKey('fq', this.field)) {
      for (var key in keys) {
        active = this.manager.store.params['fq'][key].value;
      }
    }
    return active;
  }
  
});

})(jQuery);