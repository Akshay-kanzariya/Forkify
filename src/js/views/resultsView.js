import View from './view';
import previewView from './previewView';
import icons from 'url:../../img/icons.svg';

class resultsView extends View {
  _parentElement = document.querySelector('.results');
  _errorMessage = `couldn't find the things you are looking for.`;
  _message = '';

  _generateMarkup() {
    return this._data.map(result => previewView.render(result, false)).join('');
  }
}
export default new resultsView();
