(function ($) {

AjaxSolr.SearchText = AjaxSolr.AbstractTextWidget.extend({


  /**
   * Initialize, determine the search text to use
   */
  init: function () {
    var self = this;
    var target = $(this.target);

    // Set the initial form value from either the URL or the site-wide search form
    var value = Manager.store.get('q').val() || $(this.target).find('input:text').val();
    // value = value || this.getUrlParam('querytext');

    self.set(value || this.getUrlParam('querytext'));

    nationalSearch = (this.getUrlParam('scope') === 'national') ? true : false;

    var group = this.getUrlParam('classgroup');
    if (group !== null && group !== 'all') {
      var param = new AjaxSolr.Parameter({
        name: 'fq',
        key: 'classgroup',
        value: group,
      });
      param.local('tag', 'classgroup');
      this.manager.store.add(param.name, param);
    }

    // Bind to further form submissions
    $(this.target).submit(function() {
      var target = $(self.target);

      target.find('input').blur();

      // Clear out all existing filters unless user has checked the magic box
      if ($('#keep-my-selections:checked').length < 1) {
        self.manager.store.remove('fq');
      }

      // Set the starting search scope
      var scope = target.find('.search-filter-scope input:checked').val();
      nationalSearch = (scope === 'national') ? true : false;

      // Set the starting classgroup
      var group = target.find('.search-filter-classgroup input:checked').val();
      if (group !== 'all') {
        var param = new AjaxSolr.Parameter({
          name: 'fq',
          key: 'classgroup',
          value: group,
        });
        param.local('tag', 'classgroup');
        self.manager.store.add(param.name, param);
      }

      // Set the query text
      var value = target.find('input:text').val();
      self.set(value)

      self.manager.doRequest(0);

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
      $('#results-title').text('Search results: ').append('<strong>'+q+'</strong>');

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