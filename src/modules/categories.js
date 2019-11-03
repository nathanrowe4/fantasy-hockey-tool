const categoriesModule = (function() {
  'use strict';
  const _categories = [
    'G', 'A', 'PLUSMINUS', 'PIM', 'SOG', 'PPP', 'HITS', 'FOW',
  ];

  /**
   * Helper function to get configured categories
   * @return {Array}
   */
  function getCategories() {
    return _categories;
  }

  return {
    getCategories: getCategories,
  };
}());

module.exports = categoriesModule;
