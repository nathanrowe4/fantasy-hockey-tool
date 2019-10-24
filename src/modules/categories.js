var categoriesModule = (function() {
  'use strict'
  var _categories = ['G', 'A', 'PLUSMINUS', 'PIM', 'SOG', 'PPP', 'HITS', 'FOW']

  function getCategories() {
    return _categories
  }

  return {
    getCategories: getCategories
  }
}())

module.exports = categoriesModule
