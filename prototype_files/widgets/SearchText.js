(function ($) {

AjaxSolr.SearchText = AjaxSolr.AbstractTextWidget.extend({
  
  /**
   * Initialize. Run a search if we find 'q' in the URL.
   */ 
  init: function () {
    var self = this;
    
    // Set the initial form value from either the URL or the form element
    var value = Manager.store.get('q').val() || $(this.target).find('input:text').val();
    self.set(value);
    
    // Bind to further form submissions
    $(this.target).submit(function() {
      $(this).find('input').blur();
      value = $(this).find('input:text').val();
      if (value && self.set(value)) {
        self.manager.doRequest(0);
      }
      return false;
    });
  },
  
  
  /**
   * Update the form input to the current query text. This is necessary
   * when searches are started from the URL (after hitting refresh in the browser).
   */
  afterRequest: function () {
    var q = Manager.store.get('q').val();
    if (q != '*:*') {
      $(this.target).find('input:text').val(q);
    };
  }
  
});

})(jQuery);