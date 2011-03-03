AjaxSolr.AbstractStaticFacetWidget = AjaxSolr.AbstractFacetWidget.extend({

  init: function () {
    this.setupStore();
    this.render();
  },

  afterRequest: function () {}

});
