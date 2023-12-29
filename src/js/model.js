import { async } from 'regenerator-runtime';
import { API_URL, RESULTS_PER_PAGE, KEY } from './config';
import { AJAX } from './helpers';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RESULTS_PER_PAGE,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;

  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.sourceUrl,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);

    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.page = 1;
  } catch (error) {
    throw error;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });

  state.recipe.servings = newServings;
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  state.bookmarks.push(recipe);

  if (recipe.id === state.recipe.id) {
    state.recipe.bookmarked = true;
  }

  persistBookmarks();
};

export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);
  if (id === state.recipe.id) {
    state.recipe.bookmarked = false;
  }

  persistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};
// clearBookmarks();

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = newRecipe
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        if (ingArr.length !== 3)
          throw new Error(
            `wrong ingredients format please use the correct format.`
          );
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });

    console.log(newRecipe);

    //////////////// NEEDS REFACTORING //////////////////

    // const newObject = {};
    // newRecipe.forEach(key => {
    //   const arrayObject = [];
    //   arrayObject.push(`${key[0]} : ${key[1]}`);
    //   console.log(arrayObject);
    //   // console.log(key[0], key[1]);
    // });

    // const recipe = {
    //   title: newRecipe.title,
    //   source_url: newRecipe.sourceUrl,
    //   image_url: newRecipe.image,
    //   publisher: newRecipe.publisher,
    //   cooking_time: +newRecipe.cookingTime,
    //   servings: +newRecipe.servings,
    //   ingredients,
    // };

    const recipe = {
      title: newRecipe[0][1], //.title,
      source_url: newRecipe[1][1], //.sourceUrl,
      image_url: newRecipe[2][1], //.image,
      publisher: newRecipe[3][1], //.publisher,
      cooking_time: +newRecipe[4][1], //.cookingTime,
      servings: +newRecipe[5][1], //.servings,
      ingredients,
    };
    // Object.keys(recipe).forEach(key => {
    //   // console.log(key, recipe[key]);
    // });
    ///////////////// END OF THE PART ///////////////////

    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
