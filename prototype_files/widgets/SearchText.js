(function ($) {

AjaxSolr.SearchText = AjaxSolr.AbstractTextWidget.extend({
  
  
  /**
   * Initialize, determine the search text to use
   */ 
  init: function () {
    var self = this;
    var target = $(this.target);
    
    // Set the initial form value from either the URL or the site-wide search form
    var value = Manager.store.get('q').val() || $(this.secondaryTarget).find('input:text').val();
    self.set(value);
    
    // Set the value of the AJAX search form
    $(this.target).find('input:text').val(value);
    
    // Bind to further form submissions
    $(this.target+', '+this.secondaryTarget).submit(function() {
      $(this).find('input').blur();
      value = $(this).find('input:text').val();
      if (value && self.set(value)) {
        self.manager.doRequest(0);
      }
      return false;
    });
  },
  
  
  /**
   * Always update the search form input to the current query text. This is necessary
   * when searches are started from the URL (after hitting refresh in the browser).
   */
  afterRequest: function () {
    var q = Manager.store.get('q').val();
    if (q != '*:*') {
      $(this.target).find('input:text').val(q);
      // Clear out any values on the site-wide search form
      $(this.secondaryTarget).find('input:text').val('');
    };
  }
  
});

})(jQuery);