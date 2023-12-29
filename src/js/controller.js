import stable from 'core-js/stable';
import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODEL_CLOSE_SEC } from './config.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;

    recipeView.renderSpinner();
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);
    await model.loadRecipe(id);
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.rendorError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    const query = searchView.getQuery();
    if (!query) return;

    resultsView.renderSpinner();
    console.log(resultsView);
    await model.loadSearchResults(query);
    resultsView.render(model.getSearchResultsPage());
    paginationView.render(model.state.search);
  } catch (error) {
    console.log(error);
  }
};
controlSearchResults();

const controlPagination = function (goToPage) {
  resultsView.render(model.getSearchResultsPage(goToPage));
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  model.updateServings(newServings);
  recipeView.update(model.state.recipe);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    addRecipeView.renderSpinner();
    await model.uploadRecipe(newRecipe);
    recipeView.render(model.state.recipe);
    addRecipeView.rendorMessage();
    bookmarksView.render(model.state.bookmarks);

    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODEL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.rendorError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

const controlAddBookmark = function () {
  if (model.state.recipe.bookmarked === false) {
    model.addBookmark(model.state.recipe);
    recipeView.update(model.state.recipe);
  } else {
    model.deleteBookmark(model.state.recipe.id);
    recipeView.update(model.state.recipe);
  }

  bookmarksView.render(model.state.bookmarks);
};

init();
