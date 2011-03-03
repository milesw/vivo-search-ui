(function ($) {

AjaxSolr.MultiCheckboxFacet = AjaxSolr.AbstractFacetWidget.extend({


  /**
   * Build the facet
   */
  afterRequest: function () {
    var target = $(this.target);
    
    // Always empty the facet first
    target.empty();
    
    // Don't display anything if a classgroup has not been chosen
    if (!this.manager.store.findByKey('fq', 'classgroup')) {
      return;
    };
    
    // If there were no results, don't bother looking for facets
    if (this.manager.response.response.numFound) {
      var facets = this.facets();
      var activeFacets = this.getActive();
      var limit = (this.limit != null) ? this.limit : 5;
      var includeShowallLink = false;
      
      // Don't continue if there is nothing to work with
      if (facets < 1 && activeFacets < 1) {
        return target.empty();
      }
      
      var list = $('<ul></ul>');
      list.append(AjaxSolr.theme('facet_checkbox', 'Any', 0, this.isEmpty(), 'select-any', this.id+'-all', this.allResultsClickHandler()));

      var count = 1; // Count used for #id values
      
      // Loop through facets that came back with Solr response
      if (facets.length != 0) {
        for (i=0; i<facets.length; i++) {
          var title = facets[i].value;
          var id = this.id + '-' + count;
          var checked = false;
          var handler = this.clickHandler();
          var activeIndex = AjaxSolr.inArray(title, activeFacets);
          
          // Add the initial (5) checkboxes
          if (i < limit) {
            if (activeIndex > -1) {
              checked = true;
              activeFacets.splice(activeIndex,1);
            }
            list.append(AjaxSolr.theme('facet_checkbox', title, facets[i].count, checked, '', id, handler));
            count++;
          }
          else if (activeIndex > -1) { // Then append any other active checkboxes that have facet counts
            checked = true;
            activeFacets.splice(activeIndex,1);
            list.append(AjaxSolr.theme('facet_checkbox', title, facets[i].count, checked, '', id, handler));
            count++;
          }
        }
        
        // Each facet widget should have an item limit set in its config. In AbstractFacetWidget, 
        // we add 1 to this limit when telling Solr how many facet items to return. If the number
        // of items returned by Solr is more than our set limit, we can assume there are additional 
        // facet items to offer a user, and therefore include a "Show all" link.
        if (facets.length > limit) includeShowallLink = true;
      }
      
      // There may still be leftovers that were previously selected 
      // but are not part of the response and no longer have facet counts
      if (activeFacets.length > 0) {
        for (var i=0; i < activeFacets.length; i++) {
          var id = this.id + '-' + count;
          var handler = this.clickHandler();
          list.append(AjaxSolr.theme('facet_checkbox', activeFacets[i], 0, true, '', id, handler));
        }
      }
      
      // Bind expand/collapse behavior to facet titles
      var heading = $('<h3></h3>').addClass('facet-title').text(this.title).prepend('<span class="icon"></span>').click(function() {
        $(this).parents('.facet').toggleClass('collapsed');
      });
      target.empty().append(heading).append(list);
      
      if (popups[this.id] !== undefined && includeShowallLink) {
        target.append(AjaxSolr.theme('facet_showall_link', this.popupHandler()));
      }
    }
  },


  /**
   * Change handler for "Any" checkboxes
   */
  allResultsClickHandler: function() {
    var self = this;
    return function () {
      $(this).blur();
      self.clear();
      self.manager.doRequest(0);
      return false;
    }
  },
  
  
  /**
   * Click handler for "Show all" popup links
   */
  popupHandler: function() {
    var self = this;
    return function() {
      
      // Only work if we have a popup availale
      if (popups[self.id] !== undefined) {
        
        var widget = popups[self.id];
        var target = $(widget.target);
        
        // Add popup to the manager if it's not already there,
        // then initialize and retrieve new facet data
        if (self.manager.widgets[self.id+'_popup'] === undefined) {
          self.manager.addWidget(widget);
          self.manager.widgets[widget.id].init();
          
          // Retrieve new data using the same method as Manager.executeRequest()
          // but without triggering updates to other widgets
          target.append(AjaxSolr.theme('loader_image'));
          jQuery.getJSON(self.manager.solrUrl + self.manager.servlet + '?' + self.manager.store.string() + '&wt=json&json.wrf=?', {}, function (data) { 
            self.manager.response = data;  
            widget.afterRequest();
          });
        }
        target.dialog(widget.popupOptions());
      }
      return false;
    }
  },
  
  
  /**
   * Change handler for facet checkboxes
   */
  clickHandler: function () {
    var self = this;
    return function() {
      $(this).blur();
      
      // $('#dialog').dialog('close');
      
      // Scan through facet and find all checked checkboxes
      var values = [];
      $(self.target).find('input:checked').not('.select-any input').each(function() {
        values.push($(this).attr('name'));
      });
      
      // If all have been unchecked, reset the facet to 'Any'
      if (values.length < 1) {
        self.clear();
        self.manager.doRequest(0);
        return false;
      }
      
      var param = new AjaxSolr.Parameter({
        name: 'fq',
        key: self.field,
        value: values,
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
  },
  
  
  /**
   * Get all active facet items for this facet
   */
  getActive: function() {
    var facets = [];
    if (keys = this.manager.store.findByKey('fq', this.field)) {
      for (var i=0; i<keys.length; i++) {
        var param = this.manager.store.params['fq'][keys[i]];
        if (AjaxSolr.isArray(param.value)) {
          for (var j=0; j<param.value.length; j++) {
            facets.push(param.value[j]);
          }
        }
        else {
          facets.push(param.value);
        }
      }
    }
    return facets;
  },
  
  
  /**
   * Override original function to prevent re-sorting of facets
   */
  facets: function () {
    return this.responseFacets();;
  },


  /**
   * Override original function to prevent extra quotes from being added
   */
  fq: function (value, exclude) {
    return value;
  }

});

})(jQuery);