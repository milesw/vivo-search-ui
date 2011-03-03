(function ($) {

AjaxSolr.MultiCheckboxPopup = AjaxSolr.AbstractFacetWidget.extend({
  
  
  /**
   * Build the facet
   *
   * @todo Figure out how to reuse MultiCheckboxFacet::afterRequest()
   *   since they are very similar functions.
   */
  afterRequest: function () {
    
    // Don't display anything if a classgroup has not been chosen
    if (!this.manager.store.findByKey('fq', 'classgroup')) {
      return $(this.target).empty();
    };
    
    if (this.manager.response.response.numFound) {
      var facets = this.facets();
      var activeFacets = this.getActive();
      
      // Don't continue if there is nothing to work with
      if (facets < 1 && activeFacets < 1) {
        return $(this.target).empty();
      }
      
      var list = $('<ul></ul>');
      list.append(AjaxSolr.theme('facet_checkbox', 'Any', 0, this.isEmpty(), 'deselect', this.field+'-all', this.allResultsClickHandler()));

      if (facets.length != 0) {
        for (i=0; i<facets.length; i++) {
          var title = facets[i].value;
          var id = this.id + '-' + i;
          var checked = false;
          var handler = function() { $(this).blur(); $(this).parents('ul').find('.deselect input').removeAttr('checked') };
          
          var activeIndex = AjaxSolr.inArray(title, activeFacets);
          if (activeIndex > -1) {
            checked = true;
            activeFacets.splice(activeIndex,1);
          }
          list.append(AjaxSolr.theme('facet_checkbox', facets[i].value, facets[i].count, checked, '', id, handler));
        }
      }
      
      // If there are selections with no results, be sure to include those at the end
      if (activeFacets.length > 0) {
        
        // Continue count from before so that #id attributes will be consecutive
        var i = (i !== undefined) ? i : 1;
        
        for (var j=0; j < activeFacets.length; j++) {
          var id = this.id + '-' + i;
          var handler = this.clickHandler();
          list.append(AjaxSolr.theme('facet_checkbox', activeFacets[j], 0, true, '', id, handler));
          i++;
        }
      }

      $(this.target).empty().append(list);
    }
  },


  /**
   * Click handler for "Any" checkboxes
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
   * Click handler for normal checkboxes
   */
  clickHandler: function () {
    var self = this;
    return function() {
      
      var values = [];
      $(self.target).find('input:checked').not('input.deselect').each(function() {
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
        var tag = (self.id.indexOf('_popup') > 0) ? self.id.substring(0,self.id.indexOf('_popup')) : self.id;
        param.local('tag', tag);
      }

      if (self.set.call(self, param)) {
        self.manager.doRequest(0);
      }
      return false;
    }
  },
  
  
  /**
   * Get all active filters for this facet
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
   * Override this function to prevent extra quotes from being added
   */
  fq: function (value, exclude) {
    return value;
  },
  
  
  /**
   * Define options for jQueryUI dialogs
   *
   * @see http://jqueryui.com/demos/dialog/
   */
  popupOptions: function() {
    var self = this;
    var handler = this.clickHandler();
    return {
      title: self.title,
      height: 400,
      buttons: {
        Update: function() {
          handler();
          $(this).dialog( "close" );
    		},
    		Cancel: function() {
    			$(this).dialog( "close" );
    		}
      }
    }
  }

});

})(jQuery);