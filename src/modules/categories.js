var categoriesModule = (function() {
  var categories = ['G', 'A', 'PLUSMINUS', 'PIM', 'SOG', 'PPP', 'HITS', 'FOW']

  function getCategories() {
    return categories
  }

  return {
    getCategories
  }
})

module.exports = categoriesModule
