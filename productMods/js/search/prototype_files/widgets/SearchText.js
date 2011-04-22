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
    value = value || this.getUrlParam('querytext');
    
    self.set(value);
    
    // Set the value of the AJAX search form
    $(this.target).find('input:text').val(value);
    
    // Bind to further form submissions
    $(this.target+', '+this.secondaryTarget).submit(function() {
      $(this).find('input').blur();
      value = $(this).find('input:text').val();

      // Clear out all existing filters unless user has checked the magic box
      if ($('#keep-my-selections:checked').length < 1) {
        self.manager.store.remove('fq');
      }
      
      if (value && self.set(value)) {
        self.manager.doRequest(0);
      }
      return false;
    });
  },
  
  
  /**
   * Get the value of a particular URL parameter
   */
  getUrlParam: function (name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
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
      
      // var ignore = 0;
      // ignore += (nationalSearch && Manager.store.findByKey('fq', 'siteName').length > 0) ? 1 : 0;
      // ignore += (!nationalSearch && Manager.store.findByKey('fq', 'classgroup').length > 0))
      var filterCount = (Manager.store.findByKey('fq', 'classgroup').length > 0) ? 1 : 0;
      filterCount += (nationalSearch && Manager.store.findByKey('fq', 'siteName').length > 0) ? 1 : 0;

      if (filterCount > 0) {
        if ($('#retain-filters').length < 1) {
          var checkbox = $('<input type="checkbox" id="keep-my-selections" />');
          var label = $('<label for="keep-my-selections"/>').text('Keep my current selections');
          $(this.target).append($('<div id="retain-filters"/>').append(checkbox).append(label));
        }
      }
      else {
        $('#retain-filters').remove();
      }
      
    };
  }
  
});

})(jQuery);